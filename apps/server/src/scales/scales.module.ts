import { Module } from '@nestjs/common';
import { ScalesService } from './scales.service';
import { ScalesController } from './scales.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScalesController],
  providers: [ScalesService],
  exports: [ScalesService],
})
export class ScalesModule {}
