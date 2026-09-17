import { Request } from "express";

export interface AuthenticatedRequest<T = any> extends Request {
  accessToken: string;
  authUser: T;
}
