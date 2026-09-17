import { UserReadDto } from "@modules/user/application/dtos/user-read.dto";
import { UserReadRepositoryPort } from "@modules/user/application/ports/user-read-repository.port";
import { InvalidCredentialsException } from "@modules/user/domain/user.exceptions";
import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import * as bcrypt from "bcrypt";
import validator from "validator";
import { ValidatePasswordQuery } from "./validate-password.query";

@QueryHandler(ValidatePasswordQuery)
export class ValidatePasswordHandler
  implements IQueryHandler<ValidatePasswordQuery, UserReadDto>
{
  private readonly logger = new Logger(ValidatePasswordHandler.name);

  constructor(private readonly userRepository: UserReadRepositoryPort) {}

  async execute(query: ValidatePasswordQuery): Promise<UserReadDto> {
    let userRes: UserReadDto | null;

    const isEmail = validator.isEmail(query.property);
    if (isEmail) {
      userRes = await this.userRepository.getUserByEmail(query.property);
    } else {
      userRes = await this.userRepository.getUserByUsername(query.property);
    }

    if (!userRes) {
      this.logger.error(`Failed to get user by property ${query.property}`);
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await bcrypt.compare(
      query.password,
      userRes.password
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    return userRes;
  }
}
