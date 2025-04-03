import { describe, it, expect } from "vitest";
import { calculateNumerologyData } from "./numerologyUtils.js";

// --- Test Suite for calculateNumerologyData ---
describe("calculateNumerologyData", () => {
  // --- Test Cases for Valid Inputs ---
  it("should calculate correctly for a standard date (Male)", () => {
    const result = calculateNumerologyData("1990-10-28", "Male");
    // Day: 28
    // Month: 10
    // Year: 1990
    // Bhagyank Sum: 28 + 10 + 1990 = 2028
    // Bhagyank: 2 + 0 + 2 + 8 = 12 -> 1 + 2 = 3
    expect(result).toEqual({
      moolank: 1, // 2+8 = 10 => 1
      bhagyank: 3, // Corrected calculation (still 3)
      kua: 1, // 1+9+9+0=19=>1; 11-1=10. 10%9=1. Kua=1.
      // gridNumbers: 2,8,1,0,1,9,9,0 -> 2,8,1,1,9,9 + bhagyank(3) + moolank(1) + kua(1)
      gridNumbers: expect.arrayContaining([2, 8, 1, 1, 9, 9, 3, 1, 1]), // Grid numbers remain same
    });
    expect(result?.gridNumbers).toHaveLength(9);
  });

  it("should calculate correctly for a standard date (Female)", () => {
    const result = calculateNumerologyData("1985-05-15", "Female");
    // Day: 15
    // Month: 5
    // Year: 1985
    // Bhagyank Sum: 15 + 5 + 1985 = 2005
    // Bhagyank: 2 + 0 + 0 + 5 = 7
    expect(result).toEqual({
      moolank: 6, // 1+5 = 6
      bhagyank: 7, // Corrected calculation (still 7)
      kua: 9, // 1+9+8+5=23=>5; 4+5=9. Kua=9.
      // gridNumbers: 1,5,0,5,1,9,8,5 -> 1,5,5,1,9,8,5 + bhagyank(7) + moolank(6) + kua(9)
      gridNumbers: expect.arrayContaining([1, 5, 5, 1, 9, 8, 5, 7, 6, 9]), // Grid numbers remain same
    });
    expect(result?.gridNumbers).toHaveLength(10);
  });

  it("should handle single-digit day correctly (Moolank calculation)", () => {
    const result = calculateNumerologyData("2001-01-05", "Male");
    // Day: 5
    // Month: 1
    // Year: 2001
    // Bhagyank Sum: 5 + 1 + 2001 = 2007
    // Bhagyank: 2 + 0 + 0 + 7 = 9
    expect(result).toEqual({
      moolank: 5, // 0+5 = 5
      bhagyank: 9, // Corrected calculation (still 9)
      kua: 8, // 2+0+0+1=3; 11-3=8. Kua=8.
      // gridNumbers: 0,5,0,1,2,0,0,1 -> 5,1,2,1 + bhagyank(9) + kua(8). Moolank 5 not added as day is 1-9.
      gridNumbers: expect.arrayContaining([5, 1, 2, 1, 9, 8]), // Grid numbers remain same
    });
    expect(result?.gridNumbers).toHaveLength(6);
  });

  it("should handle day 10, 20, 30 correctly (Moolank not added to grid)", () => {
    const result = calculateNumerologyData("1977-11-10", "Female");
    // Day: 10
    // Month: 11
    // Year: 1977
    // Bhagyank Sum: 10 + 11 + 1977 = 1998
    // Bhagyank: 1 + 9 + 9 + 8 = 27 -> 2 + 7 = 9
    expect(result).toEqual({
      moolank: 1, // 1+0 = 1
      bhagyank: 9, // Corrected calculation (still 9)
      kua: 1, // 1+9+7+7=24=>6; 4+6=10=>1. Kua=1.
      // gridNumbers: 1,0,1,1,1,9,7,7 -> 1,1,1,1,9,7,7 + bhagyank(9) + kua(1). Moolank 1 not added as day is 10.
      gridNumbers: expect.arrayContaining([1, 1, 1, 1, 9, 7, 7, 9, 1]), // Grid numbers remain same
    });
    expect(result?.gridNumbers).toHaveLength(9);
  });

  it("should handle Kua calculation edge case (result 0 becomes 9)", () => {
    // Example DOB leading to year sum 2 (e.g., 2000)
    const resultMale = calculateNumerologyData("2000-01-01", "Male"); // 11-2=9. Kua=9.
    expect(resultMale?.kua).toBe(9);
    // Example DOB leading to year sum 5 (e.g., 1985)
    const resultFemale = calculateNumerologyData("1985-01-01", "Female"); // 4+5=9. Kua=9.
    expect(resultFemale?.kua).toBe(9);
  });

  // --- Test Cases for Invalid Inputs ---
  it("should return null for invalid date format", () => {
    expect(calculateNumerologyData("28-10-1990", "Male")).toBeNull();
    expect(calculateNumerologyData("1990/10/28", "Male")).toBeNull();
    expect(calculateNumerologyData("19901028", "Male")).toBeNull();
  });

  it("should return null for invalid date components (e.g., month > 12)", () => {
    expect(calculateNumerologyData("1990-13-01", "Male")).toBeNull();
  });

  it("should return null for invalid date components (e.g., day > 31)", () => {
    expect(calculateNumerologyData("1990-10-32", "Male")).toBeNull();
  });

  it("should return null for missing DOB", () => {
    expect(calculateNumerologyData(null, "Male")).toBeNull();
    expect(calculateNumerologyData(undefined, "Male")).toBeNull();
    expect(calculateNumerologyData("", "Male")).toBeNull();
  });

  it("should return null for missing gender", () => {
    expect(calculateNumerologyData("1990-10-28", null)).toBeNull();
    expect(calculateNumerologyData("1990-10-28", undefined)).toBeNull();
    expect(calculateNumerologyData("1990-10-28", "")).toBeNull();
  });

  it('should handle non-Male/Female gender gracefully (Kua becomes "-")', () => {
    // The function now correctly sets Kua to '-' for non-binary genders
    const result = calculateNumerologyData("1990-10-28", "Other");
    expect(result).toEqual({
      moolank: 1,
      bhagyank: 3, // Calculation remains the same
      kua: "-", // Expect '-' as per the function logic
      // gridNumbers: 2,8,1,0,1,9,9,0 -> 2,8,1,1,9,9 + bhagyank(3) + moolank(1). Kua '-' is not added.
      gridNumbers: expect.arrayContaining([2, 8, 1, 1, 9, 9, 3, 1]),
    });
    expect(result?.gridNumbers).toHaveLength(8); // Kua is not added
  });
});
