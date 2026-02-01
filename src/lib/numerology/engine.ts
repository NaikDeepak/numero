import type { Gender, NameNumbers, NumerologyResult } from "./types";

/**
 * Sums the digits of a number string.
 */
function sumDigits(numStr: string | number): number {
  return numStr
    .toString()
    .split("")
    .reduce((sum, digit) => {
      const parsedDigit = parseInt(digit, 10);
      return sum + (Number.isNaN(parsedDigit) ? 0 : parsedDigit);
    }, 0);
}

/**
 * Reduces a number to a single digit by summing its digits repeatedly.
 */
export function reduceToSingleDigit(num: number | string): number {
  let currentNum = typeof num === "string" ? parseInt(num, 10) : num;
  if (Number.isNaN(currentNum)) return 0;

  while (currentNum > 9) {
    currentNum = sumDigits(currentNum.toString());
  }
  return currentNum;
}

/**
 * Reduces a number to a single digit or a master number (11, 22) by summing its digits repeatedly.
 */
export function reduceToSingleDigitOrMaster(num: number | string): number {
  let currentNum = typeof num === "string" ? parseInt(num, 10) : num;
  if (Number.isNaN(currentNum)) return 0;

  while (currentNum > 9 && currentNum !== 11 && currentNum !== 22) {
    currentNum = sumDigits(currentNum.toString());
  }
  return currentNum;
}

/**
 * Calculates numerology data based on Date of Birth and Gender.
 * @param dob - Date of Birth in "YYYY-MM-DD" format.
 * @param gender - Gender ("Male", "Female", or "Other").
 */
export function calculateNumerologyData(dob: string, gender: Gender): NumerologyResult | null {
  if (!dob || !gender) return null;

  const dateParts = dob.split("-");
  if (dateParts.length !== 3) return null;

  const [year, month, day] = dateParts.map((part) => parseInt(part, 10));
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  // Moolank (Root Number): Sum of the day digits, reduced to single digit
  const moolank = reduceToSingleDigit(day);

  // Bhagyank (Destiny Number): Sum the full day, month, and year numbers, then reduce the total sum.
  const bhagyankSum = day + month + year;
  const bhagyank = reduceToSingleDigit(bhagyankSum);

  // Kua Number Calculation
  const yearSumReduced = reduceToSingleDigit(sumDigits(year.toString()));
  let kua: number | string;
  const lowerCaseGender = gender.toLowerCase();

  if (lowerCaseGender === "male") {
    kua = 11 - yearSumReduced;
    kua = kua % 9;
    if (kua === 0) kua = 9;
  } else if (lowerCaseGender === "female") {
    kua = 4 + yearSumReduced;
    kua = kua % 9;
    if (kua === 0) kua = 9;
  } else {
    kua = "-";
  }

  // Grid Numbers (Lo Shu Grid)
  const dobDigits = `${day.toString().padStart(2, "0")}${month.toString().padStart(2, "0")}${year}`;
  const gridNumbers: number[] = dobDigits
    .split("")
    .map((d) => parseInt(d, 10))
    .filter((d) => !Number.isNaN(d) && d !== 0);

  // Add Bhagyank to grid
  if (typeof bhagyank === "number" && bhagyank !== 0) {
    gridNumbers.push(bhagyank);
  }

  // Add Moolank only if the original day (DD) is not 1-9, 10, 20, or 30 (Legacy Rule)
  if (!((day >= 1 && day <= 9) || day === 10 || day === 20 || day === 30)) {
    if (typeof moolank === "number" && moolank !== 0) {
      gridNumbers.push(moolank);
    }
  }

  // Add Kua if it's a valid number
  if (typeof kua === "number" && kua !== 0) {
    gridNumbers.push(kua);
  }

  return {
    moolank,
    bhagyank,
    kua,
    gridNumbers,
  };
}

const pythagoreanMap: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const VOWELS = "AEIOU";

/**
 * Calculates Name Numerology numbers (Destiny, Soul Urge, Personality) using the Pythagorean system.
 */
export function calculateNameNumbers(fullName: string): NameNumbers | null {
  if (!fullName || fullName.trim().length === 0) return null;

  const normalizedName = fullName.toUpperCase().replace(/[^A-Z]/g, "");
  if (normalizedName.length === 0) return null;

  let destinySum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;

  for (const char of normalizedName) {
    const value = pythagoreanMap[char];
    if (value) {
      destinySum += value;
      if (VOWELS.includes(char)) {
        soulUrgeSum += value;
      } else {
        personalitySum += value;
      }
    }
  }

  const destinyNumber = reduceToSingleDigitOrMaster(destinySum);
  const soulUrgeNumber = reduceToSingleDigitOrMaster(soulUrgeSum);
  const personalityNumber = reduceToSingleDigit(personalitySum);

  return {
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
  };
}

export function calculatePersonalYear(birthDay: number, birthMonth: number, targetYear: number): number {
  const sum =
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(birthMonth) +
    reduceToSingleDigit(targetYear);
  return reduceToSingleDigit(sum);
}

export function calculatePersonalMonth(personalYear: number, targetMonth: number): number {
  const sum = personalYear + reduceToSingleDigit(targetMonth);
  return reduceToSingleDigit(sum);
}

export function calculatePersonalDay(personalMonth: number, targetDay: number): number {
  const sum = personalMonth + reduceToSingleDigit(targetDay);
  return reduceToSingleDigit(sum);
}
