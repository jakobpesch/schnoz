import { SPECIAL_TYPES } from './special-types.const';
import { Special } from './special.interface';

export function isSpecial(value: unknown): value is Special {
  const special = value as Special;
  return (
    typeof special.cost === 'number' && SPECIAL_TYPES.includes(special.type)
  );
}
