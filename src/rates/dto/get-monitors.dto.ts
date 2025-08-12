import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString } from 'class-validator';
export class GetMonitorsDto {
  @ApiProperty({
    description: 'El formato de la fecha',
    enum: ['default', 'iso', 'timestamp'],
  })
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
  @IsOptional()
  @IsIn([
    'alcambio',
    'bcv',
    'criptodolar',
    'dolartoday',
    'enparalelovzla',
    'italcambio',
    'zoom',
    'binance',
    'bybit',
    'yadio',
  ])
  page?: string;
  @IsOptional() @IsString() monitor?: string;
}
