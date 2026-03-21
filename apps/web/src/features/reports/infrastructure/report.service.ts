import { ISendReport, ISupplierSendStatus } from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IReportService } from '../domain/report-service.interface';

export class ReportService implements IReportService {
  constructor(private readonly http: HttpClient) {}

  getSendStatus(windowId: string): Promise<ISupplierSendStatus[]> {
    return this.http.get<ISupplierSendStatus[]>(`/api/reports/send-status?windowId=${windowId}`);
  }

  sendToSuppliers(windowId: string, supplierIds: string[]): Promise<void> {
    return this.http.post<ISendReport, void>('/api/reports/send', { windowId, supplierIds });
  }

  downloadXlsx(windowId: string): Promise<void> {
    return this.http.download(`/api/reports/export?windowId=${windowId}`);
  }
}
