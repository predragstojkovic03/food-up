import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { EmployeeRole } from '@food-up/shared';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { ReportsService } from 'src/core/reports/application/reports.service';
import { ChangeRequestsQueryService } from 'src/core/change-requests/application/queries/change-requests-query.service';
import { WindowDeadlineJobData } from 'src/core/meal-selection-windows/infrastructure/meal-selection-window-event-handler.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { WINDOW_DEADLINE_QUEUE } from '../queue-names';

@Processor(WINDOW_DEADLINE_QUEUE, { telemetry: bullmqTelemetry })
export class MealSelectionWindowDeadlineProcessor extends WorkerHost {
  constructor(
    private readonly _windowsService: MealSelectionWindowsService,
    private readonly _reportsService: ReportsService,
    private readonly _crQueryService: ChangeRequestsQueryService,
    private readonly _employeesService: EmployeesService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<WindowDeadlineJobData>): Promise<void> {
    const { mealSelectionWindowId } = job.data;
    const start = Date.now();
    this._logger.log(
      `job:start queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1}`,
      MealSelectionWindowDeadlineProcessor.name,
    );

    const window = await this._windowsService.findOne(mealSelectionWindowId);

    if (!window.notifyOnDeadline) {
      this._logger.log(
        `Deadline job skipped: notifyOnDeadline=false windowId=${mealSelectionWindowId}`,
        MealSelectionWindowDeadlineProcessor.name,
      );
      return;
    }

    if (!window.isPastDeadline) {
      this._logger.log(
        `Deadline job skipped: window not yet past deadline windowId=${mealSelectionWindowId}`,
        MealSelectionWindowDeadlineProcessor.name,
      );
      return;
    }

    const hasApprovedCrs = await this._crQueryService.hasApprovedCrForWindowAfter(
      mealSelectionWindowId,
      new Date(0),
    );

    if (hasApprovedCrs) {
      this._logger.log(
        `Deadline auto-send suppressed: approved change requests exist — manager must send manually windowId=${mealSelectionWindowId}`,
        MealSelectionWindowDeadlineProcessor.name,
      );
      return;
    }

    const rows = await this._reportsService.getOrderSummary(mealSelectionWindowId);
    if (rows.length === 0) {
      this._logger.log(
        `Deadline auto-send skipped: no order data windowId=${mealSelectionWindowId}`,
        MealSelectionWindowDeadlineProcessor.name,
      );
      return;
    }

    const managers = await this._employeesService.findAllByBusinessEnriched(window.businessId);
    const managerIdentityId = managers.find((e) => e.role === EmployeeRole.Manager)?.identityId;

    if (!managerIdentityId) {
      this._logger.warn(
        `Deadline auto-send skipped: no manager found for business windowId=${mealSelectionWindowId}`,
        MealSelectionWindowDeadlineProcessor.name,
      );
      return;
    }

    const uniqueSupplierIds = [...new Set(rows.map((r) => r.supplierId))];

    const suppliers = await Promise.all(
      uniqueSupplierIds.map(async (supplierId) => {
        const { subject, introText } = await this._reportsService.generatePreview(
          mealSelectionWindowId,
          supplierId,
          managerIdentityId,
        );
        return { supplierId, subject, introText };
      }),
    );

    await this._reportsService.sendToSuppliers(
      mealSelectionWindowId,
      suppliers,
      managerIdentityId,
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} windowId=${mealSelectionWindowId} suppliers=${uniqueSupplierIds.length} durationMs=${Date.now() - start}`,
      MealSelectionWindowDeadlineProcessor.name,
    );
  }
}
