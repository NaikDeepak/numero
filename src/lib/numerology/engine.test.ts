import { describe, it, expect } from "vitest";
import {
  calculateNumerologyData,
  calculateNameNumbers,
  reduceToSingleDigit,
  reduceToSingleDigitOrMaster,
  calculatePersonalYear,
} from "./engine";

describe("Numerology Engine", () => {
  describe("Reductions", () => {
    it("should reduce to single digit", () => {
      expect(reduceToSingleDigit(19)).toBe(1); // 1+9=10, 1+0=1
      expect(reduceToSingleDigit(28)).toBe(1); // 2+8=10, 1+0=1
      expect(reduceToSingleDigit(11)).toBe(2);
    });

    it("should reduce to single digit or master", () => {
      expect(reduceToSingleDigitOrMaster(11)).toBe(11);
      expect(reduceToSingleDigitOrMaster(22)).toBe(22);
      expect(reduceToSingleDigitOrMaster(29)).toBe(11); // 2+9=11
      expect(reduceToSingleDigitOrMaster(38)).toBe(11); // 3+8=11
      expect(reduceToSingleDigitOrMaster(13)).toBe(4);
    });
  });

  describe("calculateNumerologyData", () => {
    it("should calculate correct Moolank and Bhagyank for 1980-01-01", () => {
      const result = calculateNumerologyData("1980-01-01", "Male");
      expect(result?.moolank).toBe(1);
      expect(result?.bhagyank).toBe(2); // 1+1+1980 = 1982 -> 1+9+8+2=20 -> 2
    });

    it("should follow legacy exclusion rules for grid numbers (day 10, 20, 30)", () => {
      // Day 10, Year 1980, Male:
      // DOB: 10-01-1980
      // dobDigits: 1, 0, 0, 1, 1, 9, 8, 0 -> [1, 1, 1, 9, 8]
      // Bhagyank: 10+1+1980 = 1991 -> 20 -> 2
      // Kua: 1980 Male -> 11 - 9 = 2
      // Moolank 1: Excluded because day is 10
      // Expected Grid: [1, 1, 1, 9, 8, 2, 2]
      const res10 = calculateNumerologyData("1980-01-10", "Male");
      const ones = res10?.gridNumbers.filter((n) => n === 1).length;
      expect(ones).toBe(3);
    });

    it("should add Moolank for other days", () => {
      // Day 11: Moolank 2. Should be added.
      const res11 = calculateNumerologyData("1990-01-11", "Male");
      // dobDigits = "11011990" -> [1, 1, 1, 1, 9, 9]
      // Moolank = 2.
      expect(res11?.gridNumbers).toContain(2);
    });
  });

  describe("calculateNameNumbers", () => {
    it("should verify Pythagorean values for 'Claude'", () => {
      // C=3, L=3, A=1, U=3, D=4, E=5
      // Sum = 3+3+1+3+4+5 = 19 -> 1
      const result = calculateNameNumbers("Claude");
      expect(result?.destinyNumber).toBe(1);
    });

    it("should verify master number preservation for names", () => {
      // Find a name that results in 11.
      // K(2) + A(1) + S(1) + I(9) = 13
      // B(2) + K(2) + T(2) + E(5) = 11
      const result = calculateNameNumbers("BKTE");
      expect(result?.destinyNumber).toBe(11);
    });
  });
});
