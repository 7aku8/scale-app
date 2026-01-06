import { IsUUID, IsNumber, IsInt, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateMeasurementDto {
  @IsUUID()
  scaleId: string;

  @IsInt()
  organizationId: number;

  @IsNumber()
  weight: number;

  @IsBoolean()
  @IsOptional()
  isValid?: boolean;

  @IsDateString()
  @IsOptional()
  time?: string;
}
