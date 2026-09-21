import {
  conflictUpdateAllExcept,
  DrizzleDb,
  InjectDb,
  schemas,
} from "@infrastructure/drizzle";
import { UserExistsOptions } from "@modules/user/application/ports/options/user-exists.options";
import { UserRepositoryPort } from "@modules/user/application/ports/user-repository.port";
import { UserRole } from "@modules/user/domain/enums/user-role.enum";
import { UserEntity } from "@modules/user/domain/models/user.model";
import { Injectable } from "@nestjs/common";
import {
  and,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  SQL,
} from "drizzle-orm";

type UserRow = typeof schemas.users.$inferSelect;

@Injectable()
export class UserPostgresRepository implements UserRepositoryPort {
  public constructor(@InjectDb() private readonly db: DrizzleDb) {}

  #toEntity(u: UserRow): UserEntity {
    return new UserEntity(
      u.id,
      new Date(u.createdAt),
      new Date(u.updatedAt),
      u.email,
      u.username,
      u.password,
      u.firstName ?? undefined,
      u.lastName ?? undefined,
      UserRole[u.role],
      u.avatar,
      [] // blockedUsers
    );
  }

  public async save(userEntity: UserEntity): Promise<UserEntity> {
    const [row] = await this.db
      .insert(schemas.users)
      .values({
        id: userEntity.id,
        email: userEntity.email,
        password: userEntity.password,
        username: userEntity.username,
        avatar: userEntity.avatar,
        createdAt: userEntity.createdAt.toISOString(),
        deletedAt: userEntity.deletedAt?.toISOString(),
        firstName: userEntity.firstName,
        lastName: userEntity.lastName,
        role: userEntity.role,
        updatedAt: userEntity.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        set: conflictUpdateAllExcept(schemas.users, ["id"]),
        target: schemas.users.id,
      })
      .returning();

    return this.#toEntity(row);
  }

  public async getUserByEmail(email: string): Promise<UserEntity | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.email, email));

    if (!row) {
      return null;
    }

    return this.#toEntity(row);
  }

  public async getUserById(id: string): Promise<UserEntity | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.id, id));

    if (!row) {
      return null;
    }

    return this.#toEntity(row);
  }

  public async getUserByUsername(username: string): Promise<UserEntity | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.username, username));

    if (!row) {
      return null;
    }

    return this.#toEntity(row);
  }

  public async userExists(options: UserExistsOptions): Promise<boolean> {
    const fields: SQL[] = [];

    if (options.email) {
      fields.push(eq(schemas.users.email, options.email));
    }

    if (options.username) {
      fields.push(eq(schemas.users.username, options.username));
    }

    const [row] = await this.db
      .select({ id: schemas.users.id })
      .from(schemas.users)
      .where(or(...fields));

    return !!row;
  }

  public async getUserIdsByNameOrUsername(
    nameOrUsernameFilter: string
  ): Promise<string[]> {
    const ilikeQuery = `%${nameOrUsernameFilter}%`;

    const rows = await this.db
      .select({ id: schemas.users.id })
      .from(schemas.users)
      .where(
        or(
          ilike(schemas.users.firstName, ilikeQuery),
          ilike(schemas.users.lastName, ilikeQuery),
          ilike(schemas.users.username, ilikeQuery)
        )
      );

    return rows.map((r) => r.id);
  }

  public async getUsersByIds(userIds: string[]): Promise<UserEntity[]> {
    const rows = await this.db
      .select()
      .from(schemas.users)
      .where(inArray(schemas.users.id, userIds));

    return rows.map((row) => this.#toEntity(row));
  }

  public async block(blockerId: string, blockedId: string): Promise<boolean> {
    const [blockedRow] = await this.db
      .select()
      .from(schemas.userBlocks)
      .where(
        and(
          eq(schemas.userBlocks.blockedId, blockedId),
          eq(schemas.userBlocks.blockerId, blockerId),
          isNull(schemas.userBlocks.deletedAt)
        )
      );

    if (blockedRow !== undefined) {
      return false;
    }

    await this.db.insert(schemas.userBlocks).values({
      blockedId,
      blockerId,
    });

    return true;
  }

  public async unblock(blockerId: string, blockedId: string): Promise<boolean> {
    const res = await this.db
      .update(schemas.userBlocks)
      .set({
        deletedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(schemas.userBlocks.blockerId, blockerId),
          eq(schemas.userBlocks.blockedId, blockedId)
        )
      );

    return res.count !== 0;
  }

  public async getBlockStatus(
    blockerId: string,
    blockedId: string
  ): Promise<boolean> {
    const [blockedRow] = await this.db
      .select()
      .from(schemas.userBlocks)
      .where(
        and(
          eq(schemas.userBlocks.blockedId, blockedId),
          eq(schemas.userBlocks.blockerId, blockerId)
        )
      );

    return !!blockedRow;
  }

  public async getBlockedUserIds(
    blockerId: string,
    blockedIds?: string[]
  ): Promise<string[]> {
    const checks: SQL[] = [
      eq(schemas.userBlocks.blockerId, blockerId),
      isNotNull(schemas.userBlocks.deletedAt),
    ];

    if (blockedIds) {
      checks.push(inArray(schemas.userBlocks.blockedId, blockedIds));
    }

    const rows = await this.db
      .select({ blockedId: schemas.userBlocks.blockedId })
      .from(schemas.userBlocks)
      .where(and(...checks));

    return rows.map((row) => row.blockedId);
  }

  public async delete(id: string): Promise<boolean> {
    const res = await this.db
      .delete(schemas.users)
      .where(eq(schemas.users.id, id));

    return res.count !== 0;
  }
}
