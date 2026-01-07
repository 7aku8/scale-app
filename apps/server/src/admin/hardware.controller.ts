import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('admin/hardware')
@UseGuards(AuthGuard, AdminGuard)
export class HardwareController {
  @Post('provision')
  provisionScale(@Body() body: { mac: string }) {
    console.log(body);

    return { status: 'created', secretToken: 'xyz...' };
  }
}
