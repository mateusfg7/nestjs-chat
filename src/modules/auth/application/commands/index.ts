import { RefreshTokensHandler } from "./refresh-tokens/refresh-tokens.handler";
import { SigninHandler } from "./signin/signin.handler";
import { SignupHandler } from "./signup/signup.handler";

export const CommandHandlers = [
  SignupHandler,
  SigninHandler,
  RefreshTokensHandler,
];
