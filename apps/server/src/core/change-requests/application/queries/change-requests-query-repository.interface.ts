import { RichChangeRequestDto } from './dto/rich-change-request.dto';

export const I_CHANGE_REQUESTS_QUERY_REPOSITORY = Symbol(
  'IChangeRequestsQueryRepository',
);

export interface IChangeRequestsQueryRepository {
  findRichByWindow(windowId: string): Promise<RichChangeRequestDto[]>;
  findRichByEmployee(employeeId: string): Promise<RichChangeRequestDto[]>;
  findPendingCountByWindow(windowId: string): Promise<number>;
  hasApprovedCrForWindowAfter(windowId: string, since: Date): Promise<boolean>;
}
