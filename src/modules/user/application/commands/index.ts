import { BlockUserHandler } from "./block-user/block-user.handler";
import { CreateUserHandler } from "./create-user/create-user.handler";
import { DeleteUserHandler } from "./delete-user/delete-user.handler";
import { UnblockUserHandler } from "./unblock-user/unblock-user.handler";

export const CommandHandlers = [
  CreateUserHandler,
  BlockUserHandler,
  UnblockUserHandler,
  DeleteUserHandler,
];
