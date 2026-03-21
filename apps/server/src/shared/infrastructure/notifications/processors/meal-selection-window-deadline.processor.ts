import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { EmployeeRole } from '@food-up/shared';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { ReportsService } from 'src/core/reports/application/reports.service';
import { ChangeRequestsQueryService } from 'src/core/change-requests/application/queries/change-requests-query.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { WINDOW_DEADLINE_QUEUE } from '../queue-names';

export interface WindowDeadlineJobPayload {
  mealSelectionWindowId: string;
}

@Processor(WINDOW_DEADLINE_QUEUE)
@Injectable()
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

  async process(job: Job<WindowDeadlineJobPayload>): Promise<void> {
    const { mealSelectionWindowId } = job.data;

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

    await this._reportsService.sendToSuppliers(
      mealSelectionWindowId,
      uniqueSupplierIds,
      managerIdentityId,
    );

    this._logger.log(
      `Deadline auto-send complete: windowId=${mealSelectionWindowId} suppliers=${uniqueSupplierIds.length}`,
      MealSelectionWindowDeadlineProcessor.name,
    );
  }
}
