import { AuthRepositoryPort } from "@modules/auth/application/ports/auth-repository.port";
import { UserIntegrationPort } from "@modules/auth/application/ports/user-integration.port";
import { TokenService } from "@modules/auth/application/services/token.service";
import { TokenGenerationException } from "@modules/auth/domain/auth.exceptions";
import { RefreshTokenEntity } from "@modules/auth/domain/models/refresh-token.entity";
import { SigninResponse } from "@modules/auth/presentation/http/dtos/signin.dto";
import { Logger } from "@nestjs/common";
import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import bcrypt from "bcrypt";
import { SigninCommand } from "./signin.command";

@CommandHandler(SigninCommand)
export class SigninHandler
  implements ICommandHandler<SigninCommand, SigninResponse>
{
  private readonly logger = new Logger(SigninHandler.name);
  private readonly HASH_SALT = 10;

  public constructor(
    private readonly userIntegrationPort: UserIntegrationPort,
    private readonly tokenService: TokenService,
    private readonly authRepository: AuthRepositoryPort,
    private readonly publisher: EventPublisher
  ) {}

  public async execute(command: SigninCommand): Promise<SigninResponse> {
    //Validate Credentials
    const user = await this.userIntegrationPort.validatePassword(
      command.property,
      command.password
    );

    // Generate Tokens
    const accessToken = await this.tokenService.signAccessToken(
      user.id,
      user.role
    );
    const refreshTokenDto = await this.tokenService.signRefreshToken(user.id);

    // Hash Refresh Token and Save
    const hashedRefreshToken = await bcrypt.hash(
      refreshTokenDto.token,
      this.HASH_SALT
    );
    const refreshTokenEntity = RefreshTokenEntity.create(
      user.id,
      hashedRefreshToken,
      refreshTokenDto.jti
    );

    const rtDomain = this.publisher.mergeObjectContext(refreshTokenEntity);

    try {
      await this.authRepository.save(rtDomain);
    } catch {
      this.logger.error(
        `Error saving refresh token during signin for user ${user.id}\n`
      );
      throw new TokenGenerationException(
        "Failed to create token; please sign in again"
      );
    }

    rtDomain.commit();

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenDto.token,
      },
    } as SigninResponse;
  }
}
