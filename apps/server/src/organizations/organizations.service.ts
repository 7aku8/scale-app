import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { organizations } from '@repo/database';
import { DB_CONNECTION } from '../database.module';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof import('@repo/database')>,
  ) {}

  async create(createDto: CreateOrganizationDto) {
    const [organization] = await this.db
      .insert(organizations)
      .values({
        name: createDto.name,
        plan: createDto.plan || 'free',
      })
      .returning();

    return organization;
  }

  async findAll() {
    return await this.db.select().from(organizations);
  }

  async findOne(id: number) {
    const [organization] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: number, updateDto: UpdateOrganizationDto) {
    const [organization] = await this.db
      .update(organizations)
      .set(updateDto)
      .where(eq(organizations.id, id))
      .returning();

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async remove(id: number) {
    const [organization] = await this.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }
}
