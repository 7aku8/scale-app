import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule, DB_CONNECTION } from './database.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ScalesModule } from './scales/scales.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AuthModule as MyAuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.instance';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            }
            : undefined,
      },
    }),
    SentryModule.forRoot(),
    PrometheusModule.register(),
    DatabaseModule,
    EventEmitterModule.forRoot(),
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      useFactory: (database: PostgresJsDatabase, config: ConfigService) => ({
        auth: auth(database, config),
      }),
      inject: [DB_CONNECTION, ConfigService],
    }),
    MyAuthModule,
    OrganizationsModule,
    UsersModule,
    ScalesModule,
    MeasurementsModule,
    MqttModule,
    WebSocketModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
