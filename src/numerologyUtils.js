
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
 * @param {string} dob - Date of Birth in "YYYY-MM-DD" format.
 * @param {string} gender - Gender ("Male" or "Female").
 * @returns {object|null} An object with moolank, bhagyank, kua, and gridNumbers, or null if input is invalid.
 */
export function calculateNumerologyData(dob, gender) {
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

    // Bhagyank (Destiny Number): Sum of all digits in DOB (DDMMYYYY), reduced to single digit
    // Ensure day and month are two digits for consistent summing
    const dobDigits = `${day.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${year}`;
    const bhagyank = reduceToSingleDigit(sumDigits(dobDigits));

    // Kua Number Calculation (Simplified version)
    // Note: Different schools of Feng Shui/Numerology might have variations (e.g., handling Kua 5)
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

// Optional: Helper to format grid numbers array for display/export
export function formatGridNumbers(gridNumbers) {
    if (!gridNumbers || gridNumbers.length === 0) return "-";
    return gridNumbers.join(', '); // Simple comma-separated string
}
