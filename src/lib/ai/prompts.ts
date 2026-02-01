export const SYSTEM_INSTRUCTION = `You are an expert Numerologist with a modern, empathetic, and slightly mystical voice.
Your goal is to provide actionable daily guidance based on numerological principles.
Avoid generic horoscopes. Be specific about the energy of the numbers.
Keep the tone uplifting but grounded. Use markdown for formatting.`

export function generateDailyForecastPrompt(
  personalDay: number,
  moolank: number,
  bhagyank: number,
  date: string
) {
  return `
    Date: ${date}
    Personal Day Number: ${personalDay}
    Root Number (Moolank): ${moolank}
    Destiny Number (Bhagyank): ${bhagyank}

    Please provide a concise daily forecast (max 150 words) for this user.
    Focus on:
    1. The energy of Personal Day ${personalDay}.
    2. How it interacts with their Root Number ${moolank}.
    3. One specific action to take and one to avoid today.

    Format:
    ## Today's Vibe
    [Description]

    **Do:** [Action]
    **Avoid:** [Action]
  `
}

export function generateReportPrompt(
  name: string,
  dob: string,
  moolank: number,
  bhagyank: number,
  gridNumbers: number[]
) {
  return `
    Profile: ${name} (DOB: ${dob})
    Moolank: ${moolank}
    Bhagyank: ${bhagyank}
    Grid Numbers: ${gridNumbers.join(", ")}

    Write a comprehensive Numerology Life Report (approx 400 words).
    Structure:
    1. **Core Essence**: Deep dive into Moolank ${moolank} and Bhagyank ${bhagyank}.
    2. **Strengths & Challenges**: Based on the grid numbers.
    3. **Life Path Guidance**: Career and relationship advice.

    Tone: Professional, mystical, empowering. Use clear paragraphs.
  `
}
