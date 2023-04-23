import { Card } from './card.interface';
import { Coordinate } from './coordinate.type';

export interface IUnitConstellation {
  coordinates: Coordinate[];
  value: Card['value'];
  // mirroredY: boolean
  mirrored: boolean;
  rotatedClockwise: 0 | 1 | 2 | 3;
}
