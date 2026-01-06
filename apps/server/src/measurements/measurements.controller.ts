import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { QueryMeasurementsDto } from './dto/query-measurements.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(@Body() createDto: CreateMeasurementDto) {
    return this.measurementsService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryMeasurementsDto) {
    return this.measurementsService.findByQuery(query);
  }

  @Get('scales/:scaleId/latest')
  getLatest(@Param('scaleId') scaleId: string, @Query('limit') limit?: number) {
    return this.measurementsService.getLatest(scaleId, limit);
  }

  @Get('scales/:scaleId/aggregated')
  getAggregated(
    @Param('scaleId') scaleId: string,
    @Query('interval') interval?: '1h' | '1d' | '1w',
  ) {
    return this.measurementsService.getAggregated(scaleId, interval);
  }
}
