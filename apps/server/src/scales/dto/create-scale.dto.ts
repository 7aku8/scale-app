import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateScaleDto {
  @IsString()
  @IsNotEmpty()
  macAddress: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  organizationId: number;
}
