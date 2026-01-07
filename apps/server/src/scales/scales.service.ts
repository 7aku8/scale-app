import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { scales } from '@repo/database';
import { DB_CONNECTION } from '../database.module';
import { CreateScaleDto } from './dto/create-scale.dto';
import { UpdateScaleDto } from './dto/update-scale.dto';

@Injectable()
export class ScalesService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof import('@repo/database')>,
  ) {}

  async create(createDto: CreateScaleDto) {
    // Check if MAC address already exists
    const existing = await this.findByMacAddress(createDto.macAddress);
    if (existing) {
      throw new ConflictException(`Scale with MAC address ${createDto.macAddress} already exists`);
    }

    const [scale] = await this.db
      .insert(scales)
      .values({
        macAddress: createDto.macAddress,
        name: createDto.name,
        secretToken: '',
        organizationId: createDto.organizationId,
      })
      .returning();

    return scale;
  }

  async findAll() {
    return await this.db.select().from(scales);
  }

  async findByOrganization(organizationId: number) {
    return await this.db.select().from(scales).where(eq(scales.organizationId, organizationId));
  }

  async findOne(id: string) {
    const [scale] = await this.db.select().from(scales).where(eq(scales.id, id)).limit(1);

    if (!scale) {
      throw new NotFoundException(`Scale with ID ${id} not found`);
    }

    return scale;
  }

  async findByMacAddress(macAddress: string) {
    const [scale] = await this.db
      .select()
      .from(scales)
      .where(eq(scales.macAddress, macAddress))
      .limit(1);

    return scale || null;
  }

  async update(id: string, updateDto: UpdateScaleDto) {
    const [scale] = await this.db
      .update(scales)
      .set(updateDto)
      .where(eq(scales.id, id))
      .returning();

    if (!scale) {
      throw new NotFoundException(`Scale with ID ${id} not found`);
    }

    return scale;
  }

  async remove(id: string) {
    const [scale] = await this.db.delete(scales).where(eq(scales.id, id)).returning();

    if (!scale) {
      throw new NotFoundException(`Scale with ID ${id} not found`);
    }

    return scale;
  }
}
