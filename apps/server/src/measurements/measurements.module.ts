import { Module } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
