export interface ValidatedTokenPayload {
  role: string;
  sub: string;
}

export abstract class AuthIntegrationPort {
  abstract verifyToken(token: string): Promise<ValidatedTokenPayload>;
}
