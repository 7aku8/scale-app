import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findByOrganization(@Query('organizationId', ParseIntPipe) organizationId: number) {
    return this.usersService.findByOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
