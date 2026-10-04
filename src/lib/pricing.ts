import { addOns } from "./data/tours";
import type { Tour } from "./types";

export const CHILD_RATE = 0.7;
export const INFANT_RATE = 0;
export const TAX_RATE = 0.05;

export function quote(tour: Pick<Tour, "price">, adults: number, children: number, infants: number, selected: string[]) {
  const subtotal = Math.round(tour.price * adults + tour.price * CHILD_RATE * children + tour.price * INFANT_RATE * infants);
  const payingPeople = adults + children;
  const addOnsTotal = selected.reduce((sum, id) => {
    const a = addOns.find((x) => x.id === id);
    if (!a) return sum;
    return sum + (a.per === "person" ? a.price * payingPeople : a.price);
  }, 0);
  const taxes = Math.round((subtotal + addOnsTotal) * TAX_RATE);
  return { subtotal, addOnsTotal, taxes, total: subtotal + addOnsTotal + taxes };
}
