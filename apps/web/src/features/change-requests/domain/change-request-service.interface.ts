import {
  IBulkUpdateChangeRequestStatus,
  ICreateChangeRequest,
  IRichChangeRequest,
} from '@food-up/shared';

export interface IChangeRequestService {
  getMy(): Promise<IRichChangeRequest[]>;
  getByWindow(windowId: string): Promise<IRichChangeRequest[]>;
  getPendingCount(windowId: string): Promise<number>;
  create(data: ICreateChangeRequest): Promise<IRichChangeRequest>;
  bulkUpdateStatus(data: IBulkUpdateChangeRequestStatus): Promise<void>;
}
