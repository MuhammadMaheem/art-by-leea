/**
 * formatPrice() — Format a number as USD currency string.
 *
 * @param price - The price in dollars (e.g., 149.99)
 * @returns Formatted string like "$149.99"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}
