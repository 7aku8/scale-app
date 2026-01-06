import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { weightMeasurements } from '@repo/database';
import { DB_CONNECTION } from '../database.module';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { QueryMeasurementsDto } from './dto/query-measurements.dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof import('@repo/database')>,
  ) {}

  async create(createDto: CreateMeasurementDto) {
    const [measurement] = await this.db
      .insert(weightMeasurements)
      .values({
        scaleId: createDto.scaleId,
        organizationId: createDto.organizationId,
        weight: createDto.weight,
        isValid: createDto.isValid ?? true,
        time: createDto.time ? new Date(createDto.time) : new Date(),
      })
      .returning();

    return measurement;
  }

  async findByQuery(query: QueryMeasurementsDto) {
    const conditions: any[] = [];

    if (query.scaleId) {
      conditions.push(eq(weightMeasurements.scaleId, query.scaleId));
    }

    if (query.organizationId) {
      conditions.push(eq(weightMeasurements.organizationId, query.organizationId));
    }

    if (query.startTime) {
      conditions.push(gte(weightMeasurements.time, new Date(query.startTime)));
    }

    if (query.endTime) {
      conditions.push(lte(weightMeasurements.time, new Date(query.endTime)));
    }

    const limit = query.limit || 100;

    return await this.db
      .select()
      .from(weightMeasurements)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(weightMeasurements.time))
      .limit(limit);
  }

  async getLatest(scaleId: string, limit: number = 10) {
    return await this.db
      .select()
      .from(weightMeasurements)
      .where(eq(weightMeasurements.scaleId, scaleId))
      .orderBy(desc(weightMeasurements.time))
      .limit(limit);
  }

  async getAggregated(scaleId: string, interval: '1h' | '1d' | '1w' = '1h') {
    const query = sql`
      SELECT
        time_bucket(${interval}, time) AS bucket,
        AVG(weight) as avg_weight,
        MIN(weight) as min_weight,
        MAX(weight) as max_weight,
        COUNT(*) as count
      FROM weight_measurements
      WHERE scale_id = ${scaleId}
        AND time > NOW() - INTERVAL '30 days'
      GROUP BY bucket
      ORDER BY bucket DESC
    `;

    return await this.db.execute(query);
  }
}
