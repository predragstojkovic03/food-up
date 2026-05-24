import { IMailPreview, IOrderSummarySend, ISendReportItem, ISupplierSendStatus } from '@food-up/shared';

export interface IReportService {
  getSendStatus(windowId: string): Promise<ISupplierSendStatus[]>;
  getPreview(windowId: string, supplierId: string): Promise<IMailPreview>;
  sendToSuppliers(windowId: string, suppliers: ISendReportItem[]): Promise<void>;
  getSends(windowId: string): Promise<IOrderSummarySend[]>;
  downloadXlsx(windowId: string): Promise<void>;
}
