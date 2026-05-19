import { IUpdateUserPreferences, IUserPreferencesResponse } from '@food-up/shared';

export interface IUserPreferencesService {
  get(): Promise<IUserPreferencesResponse>;
  update(data: IUpdateUserPreferences): Promise<IUserPreferencesResponse>;
}
