export interface IMenuPeriodResponse {
  id: string;
  startDate: string;
  endDate: string;
  supplierId: string;
}

export interface ICreateMenuPeriod {
  startDate: string;
  endDate: string;
  supplierId: string;
}

export interface IUpdateMenuPeriod {
  startDate?: string;
  endDate?: string;
}
