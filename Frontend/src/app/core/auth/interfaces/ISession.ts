import { IUser } from '../../models/api.models';

export interface ISession {
  accessToken: string;
  expiresAt: string;
  user: IUser;
}
