export interface AuthUser {
  createdAt: Date;
  firstName?: string;
  id: string;
  lastName?: string;
  role: string;
}

export abstract class UserIntegrationPort {
  public abstract createUser(data: any): Promise<AuthUser>;
  public abstract validatePassword(
    property: string,
    password: string
  ): Promise<AuthUser>;
}
