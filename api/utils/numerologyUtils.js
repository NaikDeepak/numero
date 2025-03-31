// Helper function to sum digits of a number string
function sumDigits(numStr) {
    return numStr.toString().split('').reduce((sum, digit) => {
        const parsedDigit = parseInt(digit, 10);
        // Add digit if it's a number, otherwise add 0
        return sum + (isNaN(parsedDigit) ? 0 : parsedDigit);
    }, 0);
}

// Helper function to reduce a number to a single digit by summing its digits repeatedly
function reduceToSingleDigit(num) {
    // Ensure input is treated as a number
    let currentNum = typeof num === 'string' ? parseInt(num, 10) : num;
     if (isNaN(currentNum)) return 0; // Handle invalid input

    // Keep summing digits until the number is 9 or less
    while (currentNum > 9) {
        // sumDigits expects a string
        currentNum = sumDigits(currentNum.toString());
    }
    return currentNum;
}

/**
 * Calculates numerology data based on Date of Birth and Gender.
 * Exported for use in the API server.
 * @param {string} dob - Date of Birth in "YYYY-MM-DD" format.
 * @param {string} gender - Gender ("Male" or "Female").
 * @returns {object|null} An object with moolank, bhagyank, kua, and gridNumbers, or null if input is invalid.
 */
function calculateNumerologyData(dob, gender) {
    // Input validation
    if (!dob || typeof dob !== 'string' || !gender) {
         console.error("Invalid input to calculateNumerologyData:", dob, gender);
         return null; // Return null for invalid input
    }

    let dateParts = dob.split("-"); // Expects YYYY-MM-DD format
    if (dateParts.length !== 3) {
        console.error("Invalid date format:", dob, ". Expected YYYY-MM-DD.");
        return null;
    }

    // Parse date parts and validate they are numbers
    const [year, month, day] = dateParts.map(part => parseInt(part, 10));
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
         console.error("Invalid date components:", dob);
         return null;
    }

    // Moolank (Root Number): Sum of the day digits, reduced to single digit
    const moolank = reduceToSingleDigit(day);

    // Bhagyank (Destiny Number): Sum the full day, month, and year numbers, then reduce the total sum.
    const bhagyankSum = day + month + year;
    const bhagyank = reduceToSingleDigit(bhagyankSum);

    // Kua Number Calculation (Simplified version)
    // Note: Different schools of Feng Shui/Numerology might have variations (e.g., handling Kua 5)
    // Ensure day and month are two digits for grid number collection later
    const dobDigits = `${day.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${year}`;
    const yearSumReduced = reduceToSingleDigit(sumDigits(year.toString()));
    let kua;
    const lowerCaseGender = gender.toLowerCase();

    if (lowerCaseGender === 'male') {
        kua = (11 - yearSumReduced);
         // Ensure Kua is between 1 and 9
        kua = kua % 9;
        if (kua === 0) kua = 9;
        // Some systems replace 5 with 2 for males, add if needed: if (kua === 5) kua = 2;
    } else if (lowerCaseGender === 'female') {
        kua = (4 + yearSumReduced);
        // Ensure Kua is between 1 and 9
        kua = kua % 9;
        if (kua === 0) kua = 9;
        // Some systems replace 5 with 8 for females, add if needed: if (kua === 5) kua = 8;
    } else {
        kua = '-'; // Handle cases where gender is not Male/Female
    }

    // Grid Numbers (Lo Shu Grid): Collect digits and calculated numbers
    let gridNumbers = dobDigits.split('') // Start with individual characters from DOB
                               .map(d => parseInt(d, 10)) // Convert to numbers
                               .filter(d => !isNaN(d) && d !== 0); // Keep non-zero numbers

    // Add calculated numbers (matching script.js logic)
    if (typeof bhagyank === 'number' && !isNaN(bhagyank) && bhagyank !== 0) {
        gridNumbers.push(bhagyank);
    }
    // Add Moolank only if the original day (DD) is not 1-9, 10, 20, or 30
    if (!(day >= 1 && day <= 9 || day === 10 || day === 20 || day === 30)) {
        if (typeof moolank === 'number' && !isNaN(moolank) && moolank !== 0) {
            gridNumbers.push(moolank);
        }
    }
    // Add Kua if it's a valid number (not '-')
    if (typeof kua === 'number' && !isNaN(kua) && kua !== 0) {
        gridNumbers.push(kua);
    }


    return {
        moolank,
        bhagyank,
        kua,
        gridNumbers // Array of digits present in DOB (e.g., [1, 9, 9, 0, 1, 2] -> [1, 9, 9, 1, 2])
    };
}

/**
 * Calculates Personal Year number.
 * @param {number} birthDay - Day of birth (1-31).
 * @param {number} birthMonth - Month of birth (1-12).
 * @param {number} targetYear - The year for which to calculate the Personal Year.
 * @returns {number} The Personal Year number.
 */
function calculatePersonalYear(birthDay, birthMonth, targetYear) {
    const sum = reduceToSingleDigit(birthDay) + reduceToSingleDigit(birthMonth) + reduceToSingleDigit(targetYear);
    return reduceToSingleDigit(sum);
}


// --- Name Numerology Constants and Helpers ---

const pythagoreanMap = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9
};

const vowels = "AEIOU";

/**
 * Reduces a number to a single digit or a master number (11, 22) by summing its digits repeatedly.
 * @param {number} num - The number to reduce.
 * @returns {number} The reduced single digit or master number.
 */
function reduceToSingleDigitOrMaster(num) {
    let currentNum = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(currentNum)) return 0;

    // Keep summing digits until the number is 9 or less, or it's 11 or 22
    while (currentNum > 9 && currentNum !== 11 && currentNum !== 22) {
        currentNum = sumDigits(currentNum.toString());
    }
    return currentNum;
}

// --- End Name Numerology Helpers ---


/**
 * Calculates Personal Month number.
 * @param {number} personalYear - The calculated Personal Year number.
 * @param {number} targetMonth - The month (1-12) for which to calculate the Personal Month.
 * @returns {number} The Personal Month number.
 */
function calculatePersonalMonth(personalYear, targetMonth) {
    const sum = personalYear + reduceToSingleDigit(targetMonth);
    return reduceToSingleDigit(sum);
}

/**
 * Calculates Personal Day number.
 * @param {number} personalMonth - The calculated Personal Month number.
 * @param {number} targetDay - The day (1-31) for which to calculate the Personal Day.
 * @returns {number} The Personal Day number.
 */
function calculatePersonalDay(personalMonth, targetDay) {
    const sum = personalMonth + reduceToSingleDigit(targetDay);
    return reduceToSingleDigit(sum);
}

/**
 * Calculates a compatibility score between two entities based on their Moolank/Bhagyank
 * and a reference compatibility data object.
 * @param {object} entity1 - { moolank, bhagyank }
 * @param {object} entity2 - { moolank, bhagyank }
 * @param {object} compatibilityRules - The loaded compatibilityData.json content.
 * @returns {number} A compatibility score normalized to 0-100.
 */
function calculateCompatibilityScore(entity1, entity2, compatibilityRules) {
    if (!entity1 || !entity2 || !compatibilityRules) return 0;

    const m1 = entity1.moolank;
    const b1 = entity1.bhagyank;
    const m2 = entity2.moolank;
    const b2 = entity2.bhagyank;

    let score = 0;
    const maxScore = 12; // 4 comparisons * 3 points max each

    const getScore = (num1, num2) => {
        const rules1 = compatibilityRules[num1];
        if (!rules1) return 1; // Default to neutral if rules missing for num1
        if (rules1.friendly?.includes(num2)) return 3;
        if (rules1.enemy?.includes(num2)) return 0;
        return 1; // Neutral
    };

    // Compare M1 vs M2, B1 vs B2, M1 vs B2, B1 vs M2
    score += getScore(m1, m2);
    score += getScore(b1, b2);
    score += getScore(m1, b2);
    score += getScore(b1, m2);

    return Math.round((score / maxScore) * 100); // Normalize to 0-100
}

/**
 * Calculates a time factor score based on Personal Year/Month/Day compatibility
 * with a target date's Moolank/Bhagyank.
 * @param {object} entityDobParts - { day, month, year } of the entity (team/captain).
 * @param {object} targetDateParts - { day, month, year } of the target date (match date).
 * @param {object} targetDateNumbers - { moolank, bhagyank } of the target date.
 * @param {object} compatibilityRules - The loaded compatibilityData.json content.
 * @returns {number} A time factor score normalized to 0-100.
 */
function calculateTimeFactorScore(entityDobParts, targetDateParts, targetDateNumbers, compatibilityRules) {
    if (!entityDobParts || !targetDateParts || !targetDateNumbers || !compatibilityRules) return 0;

    const personalYear = calculatePersonalYear(entityDobParts.day, entityDobParts.month, targetDateParts.year);
    const personalMonth = calculatePersonalMonth(personalYear, targetDateParts.month);
    const personalDay = calculatePersonalDay(personalMonth, targetDateParts.day);

    const matchMoolank = targetDateNumbers.moolank;
    const matchBhagyank = targetDateNumbers.bhagyank;

    let score = 0;
    const maxScore = 18; // 6 comparisons * 3 points max each

    const getScore = (num1, num2) => {
        const rules1 = compatibilityRules[num1];
        if (!rules1) return 1; // Default to neutral
        if (rules1.friendly?.includes(num2)) return 3;
        if (rules1.enemy?.includes(num2)) return 0;
        return 1; // Neutral
    };

    // Compare PY, PM, PD against Match Moolank and Bhagyank
    score += getScore(personalYear, matchMoolank);
    score += getScore(personalYear, matchBhagyank);
    score += getScore(personalMonth, matchMoolank);
    score += getScore(personalMonth, matchBhagyank);
    score += getScore(personalDay, matchMoolank);
    score += getScore(personalDay, matchBhagyank);

    return Math.round((score / maxScore) * 100); // Normalize to 0-100
}

/**
 * Calculates Name Numerology numbers (Destiny, Soul Urge, Personality) using the Pythagorean system.
 * @param {string} fullName - The full name string.
 * @returns {object|null} An object with destinyNumber, soulUrgeNumber, personalityNumber, or null if input is invalid.
 */
function calculateNameNumbers(fullName) {
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        console.error("Invalid input for calculateNameNumbers:", fullName);
        return null;
    }

    const normalizedName = fullName.toUpperCase().replace(/[^A-Z]/g, ''); // Keep only letters
    if (normalizedName.length === 0) {
        console.error("No valid letters found in name:", fullName);
        return null;
    }

    let destinySum = 0;
    let soulUrgeSum = 0;
    let personalitySum = 0;

    for (const char of normalizedName) {
        const value = pythagoreanMap[char];
        if (value) {
            destinySum += value;
            if (vowels.includes(char)) {
                soulUrgeSum += value;
            } else {
                personalitySum += value;
            }
        }
    }

    const destinyNumber = reduceToSingleDigitOrMaster(destinySum);
    const soulUrgeNumber = reduceToSingleDigitOrMaster(soulUrgeSum);
    // Personality number typically doesn't retain master numbers
    const personalityNumber = reduceToSingleDigit(personalitySum);

    return {
        destinyNumber,
        soulUrgeNumber,
        personalityNumber
    };
}


// Export the main calculation function and helpers
export {
    calculateNumerologyData,
    calculateNameNumbers, // Add the new function here
    calculatePersonalYear,
    calculatePersonalMonth,
    calculatePersonalDay,
    calculateCompatibilityScore,
    calculateTimeFactorScore,
    // Keep internal helpers if needed elsewhere, otherwise they can remain unexported
    // sumDigits,
    // reduceToSingleDigit
};
