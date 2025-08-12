import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsString } from 'class-validator';
export class ConvertDto {
  @ApiProperty({
    description: 'La moneda a convertir',
    enum: ['VES', 'USD', 'EUR'],
  })
  @IsIn(['VES', 'USD', 'EUR'])
  type!: 'VES' | 'USD' | 'EUR';

  @ApiProperty({
    description: 'El monto a convertir',
  })
  @IsNumberString()
  value!: string;

  @ApiProperty({
    description: 'El proveedor de tasas',
  })
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
  page!: string;

  @ApiProperty({
    description: 'El monitor a usar',
  })
  @IsString()
  monitor!: string;
}
