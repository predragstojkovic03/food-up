import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ChangeRequestsQueryService } from 'src/core/change-requests/application/queries/change-requests-query.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import {
  I_MAIL_SERVICE,
  IMailService,
} from 'src/shared/infrastructure/notifications/mail.service.interface';
import {
  IOrderSummarySendsRepository,
  I_ORDER_SUMMARY_SENDS_REPOSITORY,
} from '../domain/order-summary-sends.repository.interface';
import { OrderSummarySend } from '../domain/order-summary-send.entity';
import {
  IOrderSummaryQueryRepository,
  I_ORDER_SUMMARY_QUERY_REPOSITORY,
} from './queries/order-summary-query-repository.interface';
import { OrderSummaryRow } from './queries/dto/order-summary-row.dto';

export type SupplierSendStatus = {
  supplierId: string;
  supplierName: string;
  email: string | null;
  lastSentAt: Date | null;
  hasNewDataSinceLastSend: boolean;
  canSend: boolean;
};

const FUN_WORDS = [
  'mango', 'delta', 'tango', 'kiwi', 'cobalt', 'amber', 'echo', 'nova',
  'jade', 'sierra', 'solar', 'lunar', 'pepper', 'maple', 'cedar', 'onyx',
  'basil', 'zephyr', 'coral', 'indigo', 'saffron', 'jasper', 'lotus',
  'cinnamon', 'quartz', 'papaya', 'nimbus', 'falcon', 'bravo', 'pluto',
];

@Injectable()
export class ReportsService {
  constructor(
    @Inject(I_ORDER_SUMMARY_QUERY_REPOSITORY)
    private readonly _queryRepository: IOrderSummaryQueryRepository,
    @Inject(I_ORDER_SUMMARY_SENDS_REPOSITORY)
    private readonly _sendsRepository: IOrderSummarySendsRepository,
    private readonly _crQueryService: ChangeRequestsQueryService,
    @Inject(I_MAIL_SERVICE)
    private readonly _mailService: IMailService,
    private readonly _suppliersService: SuppliersService,
    private readonly _identityService: IdentityService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async getOrderSummary(windowId: string): Promise<OrderSummaryRow[]> {
    return this._queryRepository.getByWindow(windowId);
  }

  async generateXlsx(windowId: string): Promise<{ buffer: Buffer; filename: string }> {
    const rows = await this._queryRepository.getByWindow(windowId);

    const workbook = new ExcelJS.Workbook();
    const supplierGroups = this._groupBySupplier(rows);

    if (supplierGroups.size === 0) {
      const sheet = workbook.addWorksheet('No Data');
      sheet.addRow(['No meal selections found for this window.']);
    } else {
      for (const [supplierName, supplierRows] of supplierGroups) {
        const sheet = workbook.addWorksheet(supplierName.slice(0, 31));
        sheet.columns = [
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Meal', key: 'meal', width: 30 },
          { header: 'Qty', key: 'qty', width: 8 },
        ];
        sheet.getRow(1).font = { bold: true };

        for (const row of supplierRows) {
          sheet.addRow({ date: row.date, meal: row.mealName, qty: row.totalQuantity });
        }
      }
    }

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const filename = this._buildFilename();

    this._logger.log(
      `XLSX generated: windowId=${windowId} filename=${filename} rows=${rows.length}`,
      ReportsService.name,
    );

    return { buffer, filename };
  }

  async getSendStatus(windowId: string): Promise<SupplierSendStatus[]> {
    const rows = await this._queryRepository.getByWindow(windowId);
    const uniqueSupplierIds = [...new Set(rows.map((r) => r.supplierId))];

    return Promise.all(
      uniqueSupplierIds.map(async (supplierId) => {
        const supplier = await this._suppliersService.findOne(supplierId);
        const lastSend = await this._sendsRepository.findLastByWindowAndSupplier(
          windowId,
          supplierId,
        );

        const lastSentAt = lastSend?.sentAt ?? null;
        let hasNewDataSinceLastSend = false;

        if (lastSentAt) {
          hasNewDataSinceLastSend =
            await this._crQueryService.hasApprovedCrForWindowAfter(
              windowId,
              lastSentAt,
            );
        }

        const canSend =
          supplier.email !== null &&
          (lastSentAt === null || hasNewDataSinceLastSend);

        return {
          supplierId,
          supplierName: supplier.name,
          email: supplier.email,
          lastSentAt,
          hasNewDataSinceLastSend,
          canSend,
        };
      }),
    );
  }

  @DomainEvents
  async sendToSuppliers(
    windowId: string,
    supplierIds: string[],
    managerIdentityId: string,
  ): Promise<void> {
    const identity = await this._identityService.findById(managerIdentityId);
    const managerEmail = identity?.email ?? null;

    for (const supplierId of supplierIds) {
      const supplier = await this._suppliersService.findOne(supplierId);

      if (!supplier.email) {
        this._logger.warn(
          `Skipping supplier ${supplierId} (${supplier.name}) — no email configured`,
          ReportsService.name,
        );
        continue;
      }

      const rows = await this._queryRepository.getByWindowAndSupplier(
        windowId,
        supplierId,
      );

      const previousSend = await this._sendsRepository.findLastByWindowAndSupplier(
        windowId,
        supplierId,
      );
      const isFirstSend = previousSend === null;

      const subject = isFirstSend
        ? 'Order summary for your meals'
        : 'Adjusted order summary for your meals';

      const html = this._renderHtmlTable(supplier.name, rows, isFirstSend);

      await this._mailService.send(supplier.email, subject, html, {
        cc: managerEmail ?? undefined,
      });

      const send = OrderSummarySend.create(windowId, supplierId, managerIdentityId);
      await this._sendsRepository.insert(send);

      this._logger.log(
        `Order summary sent: windowId=${windowId} supplierId=${supplierId} firstSend=${isFirstSend}`,
        ReportsService.name,
      );
    }
  }

  private _renderHtmlTable(
    supplierName: string,
    rows: OrderSummaryRow[],
    isFirstSend: boolean,
  ): string {
    const intro = isFirstSend
      ? `<p>Please find below the order summary for your meals.</p>`
      : `<p><strong>This is an adjusted version of a previously sent order summary.</strong> The quantities below reflect the latest approved change requests.</p>`;

    if (rows.length === 0) {
      return `${intro}<p>No orders for this window.</p>`;
    }

    const rowsHtml = rows
      .map(
        (r) =>
          `<tr><td>${r.date}</td><td>${r.mealName}</td><td>${r.totalQuantity}</td></tr>`,
      )
      .join('');

    return `
      ${intro}
      <h3>${supplierName}</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>Date</th><th>Meal</th><th>Qty</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  private _groupBySupplier(rows: OrderSummaryRow[]): Map<string, OrderSummaryRow[]> {
    const map = new Map<string, OrderSummaryRow[]>();
    for (const row of rows) {
      const existing = map.get(row.supplierName);
      if (existing) {
        existing.push(row);
      } else {
        map.set(row.supplierName, [row]);
      }
    }
    return map;
  }

  private _buildFilename(): string {
    const word = FUN_WORDS[Math.floor(Math.random() * FUN_WORDS.length)];
    const now = new Date();
    const hhmm =
      now.getUTCHours().toString().padStart(2, '0') +
      now.getUTCMinutes().toString().padStart(2, '0');
    return `order-summary-${word}_${hhmm}.xlsx`;
  }
}
