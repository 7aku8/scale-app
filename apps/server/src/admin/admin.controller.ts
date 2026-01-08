import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('dashboard')
  getAdminStats() {
    return { status: 'Witaj Szefie', activeScales: 15, pendingOrders: 2 };
  }

  @Post('provision-scale')
  provisionScale(@Body() body: { mac: string }) {
    const secretToken = crypto.randomUUID(); // prosty przykład

    // await db.insert(scales)...

    return {
      mac: body.mac,
      secretToken: secretToken,
      message:
        'Urządzenie dodane do magazynu. Gotowe do przypisania klientowi.',
    };
  }
}
