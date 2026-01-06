import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ScalesService } from './scales.service';
import { CreateScaleDto } from './dto/create-scale.dto';
import { UpdateScaleDto } from './dto/update-scale.dto';

@Controller('scales')
export class ScalesController {
  constructor(private readonly scalesService: ScalesService) {}

  @Post()
  create(@Body() createDto: CreateScaleDto) {
    return this.scalesService.create(createDto);
  }

  @Get()
  findAll(@Query('organizationId', ParseIntPipe) organizationId?: number) {
    if (organizationId) {
      return this.scalesService.findByOrganization(organizationId);
    }
    return this.scalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scalesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateScaleDto) {
    return this.scalesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scalesService.remove(id);
  }
}
