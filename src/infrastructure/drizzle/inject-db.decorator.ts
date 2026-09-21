import { Inject } from "@nestjs/common";
import { DATABASE_TAG } from "./drizzle.constants";

export const InjectDb = () => Inject(DATABASE_TAG);
