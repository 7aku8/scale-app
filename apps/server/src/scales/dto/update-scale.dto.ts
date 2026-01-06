import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateScaleDto } from './create-scale.dto';

export class UpdateScaleDto extends PartialType(
  OmitType(CreateScaleDto, ['macAddress', 'organizationId'] as const),
) {}
