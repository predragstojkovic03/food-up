import {
  IBulkUpdateChangeRequestStatus,
  ICreateChangeRequest,
  IRichChangeRequest,
} from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IChangeRequestService } from '../domain/change-request-service.interface';

export class ChangeRequestService implements IChangeRequestService {
  constructor(private readonly http: HttpClient) {}

  getMy(): Promise<IRichChangeRequest[]> {
    return this.http.get<IRichChangeRequest[]>('/api/change-requests/my');
  }

  getByWindow(windowId: string): Promise<IRichChangeRequest[]> {
    return this.http.get<IRichChangeRequest[]>(`/api/change-requests/window/${windowId}`);
  }

  async getPendingCount(windowId: string): Promise<number> {
    const result = await this.http.get<{ count: number }>(
      `/api/change-requests/window/${windowId}/pending-count`,
    );
    return result.count;
  }

  create(data: ICreateChangeRequest): Promise<IRichChangeRequest> {
    return this.http.post<ICreateChangeRequest, IRichChangeRequest>(
      '/api/change-requests',
      data,
    );
  }

  bulkUpdateStatus(data: IBulkUpdateChangeRequestStatus): Promise<void> {
    return this.http.patch<IBulkUpdateChangeRequestStatus, void>(
      '/api/change-requests/bulk-status',
      data,
    );
  }
}
