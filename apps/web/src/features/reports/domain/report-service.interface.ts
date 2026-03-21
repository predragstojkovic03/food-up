import { ISupplierSendStatus } from '@food-up/shared';

export interface IReportService {
  getSendStatus(windowId: string): Promise<ISupplierSendStatus[]>;
  sendToSuppliers(windowId: string, supplierIds: string[]): Promise<void>;
  downloadXlsx(windowId: string): Promise<void>;
}
