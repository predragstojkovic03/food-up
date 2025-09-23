export type RegisterSupplierDto = {
  name: string;
  contactInfo: string;
  businessIds?: string[];
  password: string;
  email: string;
};
