import { IUser } from './api.models';

export interface ISession {
  accessToken: string;
  expiresAt: string;
  user: IUser;
}
