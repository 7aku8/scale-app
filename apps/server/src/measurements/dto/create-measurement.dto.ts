import { IsUUID, IsNumber, IsInt, IsBoolean, IsOptional, IsDateString, IsDate } from 'class-validator';
import { Type } from "class-transformer";

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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  time?: Date;
}
