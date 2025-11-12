import { clsx, type ClassValue } from "clsx";

import dayjs, { Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";

interface MaskOptions {
  /**
   * Number of characters to keep visible at the start of the string
   * @default 3
   */
  startVisible?: number;

  /**
   * Number of characters to keep visible at the end of the string
   * @default 2
   */
  endVisible?: number;

  /**
   * Character used for masking
   * @default 'x'
   */
  maskChar?: string;

  /**
   * Minimum length of the string before masking
   * @default 6
   */
  minLength?: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | Dayjs, format = "YYYY-MM-DD") {
  if (typeof date === "string" && date === "") {
    return "";
  }

  return dayjs(date).format(format);
}

export const numberFormatter = (
  amount: number,
  decimalPlaces = 2,
  symbol = ""
) => {
  if (!amount || isNaN(amount)) return "0";

  //   return currency(amount, {
  //     precision: decimalPlaces,
  //   }).format({ symbol });
};

export function maskString(input: string, options: MaskOptions = {}) {
  const {
    startVisible = 3,
    endVisible = 2,
    maskChar = "x",
    minLength = 6,
  } = options;

  if (input.length <= minLength) {
    return input;
  }

  const maskLength = input.length - startVisible - endVisible;

  const maskedMiddle = maskChar.repeat(maskLength);
  const maskedString =
    input.slice(0, startVisible) + maskedMiddle + input.slice(-endVisible);

  return maskedString;
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isEmpty(
  value: string | number | boolean | null | undefined | object | any[]
): boolean {
  // Check for null or undefined
  if (value === null || value === undefined) {
    return true;
  }

  // Check for empty string
  if (typeof value === "string" && value.trim().length === 0) {
    return true;
  }

  // Check for empty array
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  // Check for empty object
  if (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  // If none of the above cases, the value is not considered empty
  return false;
}

// export function getCurrencyFromCountry(country: string) {
//   switch (country) {
//     case "GHS":
//       return "GHS";
//     case "KES":
//       return "KES";
//     default:
//       return "GHS";
//   }
// }

export function formatWithSeparator(num: number | string) {
  if (num === 0 || isNaN(Number(num))) return 0;

  if (typeof num === "string") {
    num = num.replace(/,/g, "");
  }

  return num;
}
