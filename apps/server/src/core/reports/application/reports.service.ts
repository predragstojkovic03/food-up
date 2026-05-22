import { Language } from '@food-up/shared';
import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { BusinessSuppliersService } from 'src/core/business-suppliers/application/business-suppliers.service';
import { ChangeRequestsQueryService } from 'src/core/change-requests/application/queries/change-requests-query.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { t } from 'src/shared/i18n/i18n.helper';
import {
  I_MAIL_SERVICE,
  IMailService,
} from 'src/shared/infrastructure/notifications/mail/mail.service.interface';
import { OrderSummarySend } from '../domain/order-summary-send.entity';
import {
  I_ORDER_SUMMARY_SENDS_REPOSITORY,
  IOrderSummarySendsRepository,
} from '../domain/order-summary-sends.repository.interface';
import { EmployeeDaySelectionRow, OrderSummaryRow } from './queries/dto/order-summary-row.dto';
import {
  I_ORDER_SUMMARY_QUERY_REPOSITORY,
  IOrderSummaryQueryRepository,
} from './queries/order-summary-query-repository.interface';

export type SupplierSendStatus = {
  supplierId: string;
  supplierName: string;
  email: string | null;
  lastSentAt: Date | null;
  hasNewDataSinceLastSend: boolean;
  canSend: boolean;
};

const FUN_WORDS = [
  'mango',
  'delta',
  'tango',
  'kiwi',
  'cobalt',
  'amber',
  'echo',
  'nova',
  'jade',
  'sierra',
  'solar',
  'lunar',
  'pepper',
  'maple',
  'cedar',
  'onyx',
  'basil',
  'zephyr',
  'coral',
  'indigo',
  'saffron',
  'jasper',
  'lotus',
  'cinnamon',
  'quartz',
  'papaya',
  'nimbus',
  'falcon',
  'bravo',
  'pluto',
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
    private readonly _employeesService: EmployeesService,
    private readonly _businessSuppliersService: BusinessSuppliersService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async getOrderSummary(windowId: string): Promise<OrderSummaryRow[]> {
    return this._queryRepository.getByWindow(windowId);
  }

  async generateXlsx(
    windowId: string,
    language: Language,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const [rows, employeeRows] = await Promise.all([
      this._queryRepository.getByWindow(windowId),
      this._queryRepository.getEmployeeSelections(windowId),
    ]);

    const workbook = new ExcelJS.Workbook();
    const supplierGroups = this._groupBySupplier(rows);

    if (supplierGroups.size === 0) {
      const sheet = workbook.addWorksheet('No Data');
      sheet.addRow(['No meal selections found for this window.']);
    } else {
      for (const [supplierName, supplierRows] of supplierGroups) {
        this._buildSupplierSheet(workbook, supplierName, supplierRows, language);
      }
    }

    const dateGroups = this._groupEmployeesByDate(employeeRows);
    for (const [date, dayRows] of dateGroups) {
      this._buildDaySheet(workbook, date, dayRows, language);
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
        const lastSend =
          await this._sendsRepository.findLastByWindowAndSupplier(
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
    const [identity, managerEmployee] = await Promise.all([
      this._identityService.findById(managerIdentityId),
      this._employeesService.findByIdentity(managerIdentityId),
    ]);
    const managerEmail = identity?.email ?? null;
    const businessId = managerEmployee.businessId;

    for (const supplierId of supplierIds) {
      const supplier = await this._suppliersService.findOne(supplierId);

      if (!supplier.email) {
        this._logger.warn(
          `Skipping supplier ${supplierId} (${supplier.name}) — no email configured`,
          ReportsService.name,
        );
        continue;
      }

      let lang: Language;
      if (supplier.isManaged()) {
        lang = supplier.language;
      } else {
        const bs = await this._businessSuppliersService.findBySupplierAndBusiness(supplierId, businessId);
        lang = bs?.language ?? Language.En;
      }

      const rows = await this._queryRepository.getByWindowAndSupplier(
        windowId,
        supplierId,
      );

      const previousSend =
        await this._sendsRepository.findLastByWindowAndSupplier(
          windowId,
          supplierId,
        );
      const isFirstSend = previousSend === null;

      const subject = isFirstSend
        ? t((k) => k.mail.orderSummary.subject, lang)
        : t((k) => k.mail.orderSummary.subjectAdjusted, lang);

      const html = this._renderHtmlTable(supplier.name, rows, isFirstSend, lang);

      await this._mailService.send(supplier.email, subject, html, {
        cc: managerEmail ?? undefined,
      });

      const send = OrderSummarySend.create(
        windowId,
        supplierId,
        managerIdentityId,
      );
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
    lang: Language,
  ): string {
    const intro = isFirstSend
      ? `<p>${t((k) => k.mail.orderSummary.intro, lang)}</p>`
      : `<p><strong>${t((k) => k.mail.orderSummary.introAdjusted, lang)}</strong></p>`;

    if (rows.length === 0) {
      return `${intro}<p>${t((k) => k.mail.orderSummary.noOrders, lang)}</p>`;
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
        <thead><tr><th>${t((k) => k.mail.orderSummary.table.date, lang)}</th><th>${t((k) => k.mail.orderSummary.table.meal, lang)}</th><th>${t((k) => k.mail.orderSummary.table.qty, lang)}</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  private _buildSupplierSheet(
    workbook: ExcelJS.Workbook,
    supplierName: string,
    rows: OrderSummaryRow[],
    lang: Language,
  ): void {
    const sheet = workbook.addWorksheet(supplierName.slice(0, 31));
    sheet.columns = [
      { key: 'meal', width: 35 },
      { key: 'qty', width: 8 },
    ];

    const byDate = this._groupByDateAndType(rows);

    for (const [date, typeGroups] of byDate) {
      const dayRow = sheet.addRow([this._formatDayLabel(date, lang), '']);
      sheet.mergeCells(dayRow.number, 1, dayRow.number, 2);
      dayRow.getCell(1).font = { bold: true, size: 11 };
      dayRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD0E4FF' },
      };
      dayRow.getCell(1).alignment = { vertical: 'middle' };

      for (const [mealType, meals] of typeGroups) {
        const typeRow = sheet.addRow([this._formatMealTypeLabel(mealType, lang), '']);
        sheet.mergeCells(typeRow.number, 1, typeRow.number, 2);
        typeRow.getCell(1).font = { bold: true, italic: true };
        typeRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFECF5FF' },
        };
        typeRow.getCell(1).alignment = { indent: 1 };

        for (const meal of meals) {
          const mealRow = sheet.addRow({ meal: meal.mealName, qty: meal.totalQuantity });
          mealRow.getCell(1).alignment = { indent: 2 };
        }
      }

      sheet.addRow([]);
    }
  }

  private _buildDaySheet(
    workbook: ExcelJS.Workbook,
    date: string,
    rows: EmployeeDaySelectionRow[],
    lang: Language,
  ): void {
    const sheetName = this._formatShortDayLabel(date, lang);
    const sheet = workbook.addWorksheet(sheetName);

    const hasMultiQuantity = rows.some((r) => r.quantity > 1);

    if (hasMultiQuantity) {
      sheet.columns = [
        { header: t((k) => k.excel.columns.employeeName, lang), key: 'employee', width: 28 },
        { header: t((k) => k.excel.columns.meal, lang), key: 'meal', width: 35 },
        { header: t((k) => k.excel.columns.qty, lang), key: 'qty', width: 8 },
      ];
    } else {
      sheet.columns = [
        { header: t((k) => k.excel.columns.employeeName, lang), key: 'employee', width: 28 },
        { header: t((k) => k.excel.columns.meal, lang), key: 'meal', width: 35 },
      ];
    }

    sheet.getRow(1).font = { bold: true };

    for (const row of rows) {
      if (hasMultiQuantity) {
        sheet.addRow({ employee: row.employeeName, meal: row.mealName, qty: row.quantity });
      } else {
        sheet.addRow({ employee: row.employeeName, meal: row.mealName });
      }
    }
  }

  private _groupBySupplier(
    rows: OrderSummaryRow[],
  ): Map<string, OrderSummaryRow[]> {
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

  private _groupByDateAndType(
    rows: OrderSummaryRow[],
  ): Map<string, Map<string, OrderSummaryRow[]>> {
    const byDate = new Map<string, Map<string, OrderSummaryRow[]>>();
    for (const row of rows) {
      if (!byDate.has(row.date)) {
        byDate.set(row.date, new Map());
      }
      const typeMap = byDate.get(row.date)!;
      if (!typeMap.has(row.mealType)) {
        typeMap.set(row.mealType, []);
      }
      typeMap.get(row.mealType)!.push(row);
    }
    return byDate;
  }

  private _groupEmployeesByDate(
    rows: EmployeeDaySelectionRow[],
  ): Map<string, EmployeeDaySelectionRow[]> {
    const map = new Map<string, EmployeeDaySelectionRow[]>();
    for (const row of rows) {
      const existing = map.get(row.date);
      if (existing) {
        existing.push(row);
      } else {
        map.set(row.date, [row]);
      }
    }
    return map;
  }

  private _formatDayLabel(date: string, lang: Language): string {
    const locale = lang === Language.Sr ? 'sr-Latn-RS' : 'en-US';
    const d = new Date(date + 'T00:00:00Z');
    const dayName = d.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
    const dateStr = d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return `${dayName}, ${dateStr}`;
  }

  private _formatShortDayLabel(date: string, lang: Language): string {
    const locale = lang === Language.Sr ? 'sr-Latn-RS' : 'en-US';
    const d = new Date(date + 'T00:00:00Z');
    const dayShort = d.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' });
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dayShort} ${day}-${month}`;
  }

  private _formatMealTypeLabel(mealType: string, lang: Language): string {
    switch (mealType) {
      case 'breakfast': return t((k) => k.excel.mealTypes.breakfast, lang);
      case 'lunch':     return t((k) => k.excel.mealTypes.lunch, lang);
      case 'dinner':    return t((k) => k.excel.mealTypes.dinner, lang);
      case 'bread':     return t((k) => k.excel.mealTypes.bread, lang);
      case 'soup':      return t((k) => k.excel.mealTypes.soup, lang);
      case 'salad':     return t((k) => k.excel.mealTypes.salad, lang);
      case 'dessert':   return t((k) => k.excel.mealTypes.dessert, lang);
      default:          return mealType.charAt(0).toUpperCase() + mealType.slice(1) + 's';
    }
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
