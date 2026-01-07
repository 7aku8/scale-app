import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { HardwareController } from './hardware.controller';

@Module({
  controllers: [HardwareController],
  providers: [AdminService],
})
export class AdminModule {}
