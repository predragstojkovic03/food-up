export type OrderSummaryRow = {
  supplierId: string;
  supplierName: string;
  date: string;
  mealType: string;
  mealName: string;
  totalQuantity: number;
};

export type EmployeeDaySelectionRow = {
  date: string;
  employeeName: string;
  mealName: string;
  quantity: number;
};
