export interface ISupplierSendStatus {
  supplierId: string;
  supplierName: string;
  email: string | null;
  lastSentAt: string | null;
  hasNewDataSinceLastSend: boolean;
  canSend: boolean;
}

export interface ISendReport {
  windowId: string;
  supplierIds: string[];
}
