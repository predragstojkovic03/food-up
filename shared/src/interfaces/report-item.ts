// Shared interfaces for Report Item DTOs

export interface ICreateReportItem {
  reportId: string;
  menuItemId: string;
  date: Date;
  quantity: number;
}

export interface IUpdateReportItem {
  reportId?: string;
  menuItemId?: string;
  date?: Date;
  quantity?: number;
}

export interface IReportItemResponse {
  id: string;
  reportId: string;
  menuItemId: string;
  date: Date;
  quantity: number;
}
