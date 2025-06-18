export type CreateEmployeeDto = {
  name: string;
  email: string;
  isAdmin?: boolean;
  businessId: string;
};
