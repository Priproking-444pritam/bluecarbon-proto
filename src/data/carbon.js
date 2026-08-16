/** Rough annual sequestration rates used only for the prototype estimate. */
export const RATES_TCO2_PER_HA_YEAR = {
  Mangroves: 10,
  Seagrass: 4,
  "Salt Marsh": 6,
  Wetlands: 5,
  Mixed: 7,
};

export function estimateCredits(areaHa, ecosystem, years = 1) {
  const ha = Number(areaHa) || 0;
  const rate = RATES_TCO2_PER_HA_YEAR[ecosystem] || RATES_TCO2_PER_HA_YEAR.Mixed;
  const y = Number(years) || 1;
  return Math.round(ha * rate * y * 10) / 10;
}
