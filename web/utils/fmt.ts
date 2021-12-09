import { Decimal } from 'decimal.js';

export function fiat(amount:string|number|Decimal, symbol:string='$', places:number=2) {
  const x = new Decimal(amount)
  return `${symbol}${x.toFixed(places)}`;
}

export function amount(amount:string|number|Decimal, places:number=8, withSign:boolean=true) {
  const x = new Decimal(amount)
  if (withSign) {
    if (x.gte(0)) {
      return `+${x.toFixed(places)}`;
    }
    return x.toFixed(places);
  } else {
    return x.abs().toFixed(places);
  }
}
