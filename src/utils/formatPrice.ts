/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// priceLabel is free text typed by the admin (e.g. "₹22.0 Lakh"), often
// produced by dividing a raw rupee amount and calling toFixed(1)/(2), which
// leaves a trailing ".0"/".00" even when there's no meaningful decimal.
// This strips those trailing zeros (and a now-dangling decimal point) while
// leaving real decimals like "₹45.5 Lakh" or "₹1.85 Crore" untouched.
export function formatPriceLabel(priceLabel: string): string {
  if (!priceLabel) return priceLabel;
  return priceLabel.replace(/\d+\.\d+/g, (match) => match.replace(/0+$/, '').replace(/\.$/, ''));
}
