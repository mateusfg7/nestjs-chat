import { DrizzleDb, InjectDb, schemas } from "@infrastructure/drizzle";
import { UserReadDto } from "@modules/user/application/dtos/user-read.dto";
import { UserReadRepositoryPort } from "@modules/user/application/ports/user-read-repository.port";
import { UserRole } from "@modules/user/domain/enums/user-role.enum";
import { Injectable } from "@nestjs/common";
import { and, eq, ilike, inArray, isNotNull, or, SQL } from "drizzle-orm";

type UserRow = typeof schemas.users.$inferSelect;

@Injectable()
export class UserPostgresReadRepository implements UserReadRepositoryPort {
  public constructor(@InjectDb() private readonly db: DrizzleDb) {}

  #toDto(user: UserRow): UserReadDto {
    return new UserReadDto(
      user.id,
      user.email,
      user.username,
      UserRole[user.role],
      user.firstName,
      user.lastName,
      user.avatar,
      new Date(user.createdAt),
      user.password // Included for validate password query
    );
  }

  public async getUserByEmail(email: string): Promise<UserReadDto | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.email, email));

    if (!row) {
      return null;
    }

    return this.#toDto(row);
  }

  public async getUserById(id: string): Promise<UserReadDto | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.id, id));

    if (!row) {
      return null;
    }

    return this.#toDto(row);
  }

  public async getUserByUsername(
    username: string
  ): Promise<UserReadDto | null> {
    const [row] = await this.db
      .select()
      .from(schemas.users)
      .where(eq(schemas.users.username, username));

    if (!row) {
      return null;
    }

    return this.#toDto(row);
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

  public async getUsersByIds(userIds: string[]): Promise<UserReadDto[]> {
    const rows = await this.db
      .select()
      .from(schemas.users)
      .where(inArray(schemas.users.id, userIds));

    return rows.map((row) => this.#toDto(row));
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
}
