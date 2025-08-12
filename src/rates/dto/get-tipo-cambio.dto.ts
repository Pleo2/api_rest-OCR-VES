import { IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTipoCambioDto {
  @ApiProperty({
    description: 'La moneda a convertir',
    enum: ['usd', 'eur'],
  })
  @IsIn(['usd', 'eur'])
  currency!: 'usd' | 'eur';

  @IsOptional()
  @IsIn(['default', 'iso', 'timestamp'])
  format_date?: 'default' | 'iso' | 'timestamp';

  @IsOptional()
  @ApiProperty({
    description: 'Si el precio debe ser redondeado',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  rounded_price?: 'true' | 'false';
}
