/**
 * formatPrice() — Format a number as PKR currency string.
 *
 * @param price - The price in rupees (e.g., 5000)
 * @returns Formatted string like "Rs. 5,000"
 */
export function formatPrice(price: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK").format(price)}`;
}
