import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@repo/database';

export const DB_CONNECTION = 'DB_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DB_CONNECTION,
      useFactory: (config: ConfigService) => {
        const connString = config.get<string>('DATABASE_URL') || process.env.DATABASE_URL || '';
        const client = postgres(connString);
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_CONNECTION],
})
export class DatabaseModule { }
