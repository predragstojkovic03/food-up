import { Inject, Injectable } from '@nestjs/common';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import {
  I_CHANGE_REQUESTS_QUERY_REPOSITORY,
  IChangeRequestsQueryRepository,
} from './change-requests-query-repository.interface';
import { RichChangeRequestDto } from './dto/rich-change-request.dto';

@Injectable()
export class ChangeRequestsQueryService {
  constructor(
    @Inject(I_CHANGE_REQUESTS_QUERY_REPOSITORY)
    private readonly _repository: IChangeRequestsQueryRepository,
    private readonly _windowsService: MealSelectionWindowsService,
  ) {}

  async findRichByWindowInMyBusiness(
    windowId: string,
    identityId: string,
  ): Promise<RichChangeRequestDto[]> {
    await this._windowsService.findOneInMyBusiness(windowId, identityId);
    return this._repository.findRichByWindow(windowId);
  }

  findRichByEmployee(employeeId: string): Promise<RichChangeRequestDto[]> {
    return this._repository.findRichByEmployee(employeeId);
  }

  async findPendingCountByWindowInMyBusiness(
    windowId: string,
    identityId: string,
  ): Promise<number> {
    await this._windowsService.findOneInMyBusiness(windowId, identityId);
    return this._repository.findPendingCountByWindow(windowId);
  }

  hasApprovedCrForWindowAfter(windowId: string, since: Date): Promise<boolean> {
    return this._repository.hasApprovedCrForWindowAfter(windowId, since);
  }
}
