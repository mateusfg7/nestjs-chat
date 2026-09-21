import { authSchemas } from "./auth";
import { chatSchemas } from "./chat";
import { userSchemas } from "./user";

export const schemas = {
  ...authSchemas,
  ...chatSchemas,
  ...userSchemas,
};
