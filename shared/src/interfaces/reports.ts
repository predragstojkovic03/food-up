export interface ISupplierSendStatus {
  supplierId: string;
  supplierName: string;
  email: string | null;
  lastSentAt: string | null;
  hasNewDataSinceLastSend: boolean;
  canSend: boolean;
}

export interface IMailPreview {
  supplierId: string;
  subject: string;
  introText: string;
  html: string;
}

export interface ISendReportItem {
  supplierId: string;
  subject: string;
  introText: string;
}

export interface ISendReport {
  windowId: string;
  suppliers: ISendReportItem[];
}

export interface IOrderSummarySend {
  id: string;
  supplierId: string;
  supplierName: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
}
