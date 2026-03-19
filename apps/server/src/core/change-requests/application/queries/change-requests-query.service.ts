import { Inject, Injectable } from '@nestjs/common';
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
  ) {}

  findRichByWindow(windowId: string): Promise<RichChangeRequestDto[]> {
    return this._repository.findRichByWindow(windowId);
  }

  findRichByEmployee(employeeId: string): Promise<RichChangeRequestDto[]> {
    return this._repository.findRichByEmployee(employeeId);
  }

  findPendingCountByWindow(windowId: string): Promise<number> {
    return this._repository.findPendingCountByWindow(windowId);
  }
}
