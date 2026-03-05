/**
 * Lightweight "AI" conversion scoring:
 * We compute features from session events and apply a logistic function.
 * This is deterministic, explainable, and great for demos/clients.
 */

export type SessionFeatures = {
  pageViews: number;
  addToCart: number;
  checkoutStart: number;
  purchases: number;
  searches: number;
  recencyMinutes: number; // since last event
  deviceMobile: number;   // 1 if mobile else 0
};

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Coefficients chosen to behave realistically:
 * - add_to_cart and checkout_start raise probability
 * - purchase strongly raises probability
 * - recency decays
 * - mobile slightly lowers average conversion (for demo)
 */
const W = {
  bias: -2.0,
  pageViews: 0.08,
  addToCart: 0.9,
  checkoutStart: 1.4,
  purchases: 2.8,
  searches: 0.12,
  recencyMinutes: -0.002,
  deviceMobile: -0.15
};

export function conversionProbability(f: SessionFeatures) {
  const z =
    W.bias +
    W.pageViews * f.pageViews +
    W.addToCart * f.addToCart +
    W.checkoutStart * f.checkoutStart +
    W.purchases * f.purchases +
    W.searches * f.searches +
    W.recencyMinutes * f.recencyMinutes +
    W.deviceMobile * f.deviceMobile;

  const p = sigmoid(z);
  return Math.max(0, Math.min(1, p));
}

export function segmentFromProbability(p: number) {
  if (p >= 0.7) return "A (Hot)";
  if (p >= 0.4) return "B (Warm)";
  return "C (Cold)";
}

export function recommendations(f: SessionFeatures, p: number) {
  const tips: string[] = [];
  if (f.addToCart > 0 && f.checkoutStart === 0) tips.push("Add friction-free checkout (1-click / guest checkout).");
  if (f.pageViews >= 5 && f.addToCart === 0) tips.push("Improve product discovery: highlight bestsellers + social proof.");
  if (f.searches >= 2) tips.push("Optimize search results (synonyms, typo-tolerance, ranking).");
  if (f.recencyMinutes > 1440) tips.push("Send re-engagement email/push within 24–48h.");
  if (p < 0.4) tips.push("Offer time-limited incentive (free shipping / 5% off) to re-activate intent.");
  return tips.slice(0, 4);
}
