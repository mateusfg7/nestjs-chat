import { authConfig } from "@modules/auth/infrastructure/config/auth.config";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidV4 } from "uuid";

@Injectable()
export class TokenService {
  public constructor(
    @Inject(authConfig.KEY)
    private readonly authConf: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService
  ) {}

  public async signAccessToken(userId: string, role: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        role,
      },
      {
        privateKey: this.authConf.accessPrivateKey,
        expiresIn: "1d",
      }
    );
  }

  public async signRefreshToken(
    userId: string
  ): Promise<{ token: string; jti: string }> {
    const jti = uuidV4();
    const token = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        privateKey: this.authConf.refreshPrivateKey,
        expiresIn: "7d",
        jwtid: jti,
      }
    );

    return { token, jti };
  }

  public async verifyAccessToken<T extends object = any>(
    token: string
  ): Promise<T> {
    return await this.jwtService.verifyAsync<T>(token, {
      publicKey: this.authConf.accessPublicKey,
    });
  }

  public async verifyRefreshToken<T extends object = any>(
    token: string
  ): Promise<T> {
    return await this.jwtService.verifyAsync<T>(token, {
      publicKey: this.authConf.refreshPublicKey,
    });
  }
}
