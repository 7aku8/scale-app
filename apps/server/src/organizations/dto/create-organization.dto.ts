import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['free', 'pro', 'enterprise'])
  plan?: 'free' | 'pro' | 'enterprise';
}
