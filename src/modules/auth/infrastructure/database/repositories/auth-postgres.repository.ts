import {
  conflictUpdateAllExcept,
  DrizzleDb,
  InjectDb,
  schemas,
} from "@infrastructure/drizzle";
import { AuthRepositoryPort } from "@modules/auth/application/ports/auth-repository.port";
import { RefreshTokenEntity } from "@modules/auth/domain/models/refresh-token.entity";

import { Injectable } from "@nestjs/common";

import { and, eq } from "drizzle-orm";

type RefreshTokenRow = typeof schemas.refreshTokens.$inferSelect;

@Injectable()
export class AuthPostgresRepository implements AuthRepositoryPort {
  public constructor(@InjectDb() private readonly db: DrizzleDb) {}

  #toDomain(row: RefreshTokenRow): RefreshTokenEntity {
    return new RefreshTokenEntity(
      row.id,
      new Date(row.createdAt),
      new Date(row.updatedAt),
      row.userId,
      row.token,
      row.identifier,
      row.deletedAt ? new Date(row.deletedAt) : null
    );
  }

  public async save(entity: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    const [row] = await this.db
      .insert(schemas.refreshTokens)
      .values({
        id: entity.id,
        identifier: entity.identifier,
        token: entity.token,
        userId: entity.userId,
        createdAt: entity.createdAt.toISOString(),
        deletedAt: entity.deletedAt?.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schemas.refreshTokens.id,
        set: conflictUpdateAllExcept(schemas.refreshTokens, ["id"]),
      })
      .returning();

    return this.#toDomain(row);
  }

  public async getRefreshToken(
    identifier: string,
    userId: string
  ): Promise<RefreshTokenEntity | null> {
    const rows = await this.db
      .select()
      .from(schemas.refreshTokens)
      .where(
        and(
          eq(schemas.refreshTokens.identifier, identifier),
          eq(schemas.refreshTokens.userId, userId)
        )
      );

    if (rows.length === 0) {
      return null;
    }

    return this.#toDomain(rows[0]);
  }
}
