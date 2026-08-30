import type { DigitResult } from "./digitResult";

export interface Guess {
  value: string;
  results: DigitResult[];
}