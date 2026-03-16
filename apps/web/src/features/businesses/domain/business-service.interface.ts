export interface IBusinessOption {
  id: string;
  name: string;
}

export interface IBusinessService {
  findAll(): Promise<IBusinessOption[]>;
}
