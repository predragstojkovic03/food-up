import { IUpdateUserPreferences, IUserPreferencesResponse } from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IUserPreferencesService } from '../domain/user-preferences-service.interface';

export class UserPreferencesService implements IUserPreferencesService {
  constructor(private readonly _http: HttpClient) {}

  get(): Promise<IUserPreferencesResponse> {
    return this._http.get<IUserPreferencesResponse>('/api/me/preferences');
  }

  update(data: IUpdateUserPreferences): Promise<IUserPreferencesResponse> {
    return this._http.patch<IUpdateUserPreferences, IUserPreferencesResponse>('/api/me/preferences', data);
  }
}
