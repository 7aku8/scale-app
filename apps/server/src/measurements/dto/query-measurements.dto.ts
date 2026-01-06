import { IsUUID, IsInt, IsOptional, IsDateString } from 'class-validator';

export class QueryMeasurementsDto {
  @IsUUID()
  @IsOptional()
  scaleId?: string;

  @IsInt()
  @IsOptional()
  organizationId?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @IsOptional()
  limit?: number;
}
