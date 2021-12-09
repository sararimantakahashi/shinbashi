import Decimal from 'decimal.js';

export function filteredAssets(assets:any) {
  const sorted = assets.filter((a:any) => {
    return (new Decimal(a.amount || a.balance)).mul(a.price_usd).greaterThan(0.00000001);
  }).sort((a:any, b:any) => {
    const valA = (new Decimal(a.amount || a.balance)).mul(a.price_usd);
    const valB = (new Decimal(b.amount || b.balance)).mul(b.price_usd);
    if (valA.greaterThan(valB)) {
      return -1;
    } else if (valA.lessThan(valB)) {
      return 1;
    }
    return 0;
  });
  return sorted;
}

export function loginRequired(router:any, user:any) {
  if (!user) {
    router.push('/')
    return true;
  }
  return false;
}