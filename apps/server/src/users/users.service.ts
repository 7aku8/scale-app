import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from '@repo/database';
import { DB_CONNECTION } from '../database.module';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof import('@repo/database')>,
  ) {}

  async findByOrganization(organizationId: number) {
    return await this.db.select().from(users).where(eq(users.organizationId, organizationId));
  }

  async findOne(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }
}
