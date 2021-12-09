export function getAssets(pairs:any) {
  const assetSet = new Set<any>();
  for (let ix = 0; ix < pairs.length; ix++) {
    const pair = pairs[ix];
    if (!assetSet.has(pair.base_asset_id)) {
      assetSet.add(pair.base_asset_id);
    }
    if (!assetSet.has(pair.quote_asset_id)) {
      assetSet.add(pair.quote_asset_id);
    }
  }
  return Array.from(assetSet);
}
