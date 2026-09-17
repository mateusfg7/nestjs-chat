export interface ClientData {
  accessToken?: string;
  authPromise?: Promise<any> | null;
  authUser?: any;
}
