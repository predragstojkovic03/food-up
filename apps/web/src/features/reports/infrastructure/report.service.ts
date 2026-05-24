import { IMailPreview, IOrderSummarySend, ISendReport, ISendReportItem, ISupplierSendStatus, IWindowCostSummary } from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IReportService } from '../domain/report-service.interface';

export class ReportService implements IReportService {
  constructor(private readonly http: HttpClient) {}

  getSendStatus(windowId: string): Promise<ISupplierSendStatus[]> {
    return this.http.get<ISupplierSendStatus[]>(`/api/reports/send-status?windowId=${windowId}`);
  }

  getPreview(windowId: string, supplierId: string): Promise<IMailPreview> {
    return this.http.get<IMailPreview>(`/api/reports/preview?windowId=${windowId}&supplierId=${supplierId}`);
  }

  sendToSuppliers(windowId: string, suppliers: ISendReportItem[]): Promise<void> {
    return this.http.post<ISendReport, void>('/api/reports/send', { windowId, suppliers });
  }

  getSends(windowId: string): Promise<IOrderSummarySend[]> {
    return this.http.get<IOrderSummarySend[]>(`/api/reports/sends?windowId=${windowId}`);
  }

  downloadXlsx(windowId: string): Promise<void> {
    return this.http.download(`/api/reports/export?windowId=${windowId}`);
  }

  getCostSummary(windowId: string): Promise<IWindowCostSummary[]> {
    return this.http.get<IWindowCostSummary[]>(`/api/reports/cost-summary?windowId=${windowId}`);
  }
}
