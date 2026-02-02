import { writeFileSync } from "node:fs"
import { generateCompatibilityPDF } from "./src/lib/pdf/compatibility"

async function test() {
  const data = {
    user: {
      name: "John Doe",
      dob: "1990-01-01",
      result: {
        moolank: 1,
        bhagyank: 2,
        kua: 2,
        gridNumbers: [1, 9, 9, 0, 0, 1, 0, 1], // Example
      },
    },
    partner: {
      name: "Jane Smith",
      dob: "1992-05-15",
      result: {
        moolank: 6,
        bhagyank: 5,
        kua: 4,
        gridNumbers: [1, 9, 9, 2, 0, 5, 1, 5], // Example
      },
    },
    analysis: "This is a test analysis for PDF generation. **Bold text** should be cleaned.",
  }

  try {
    // biome-ignore lint/suspicious/noExplicitAny: test data casting
    const buffer = await generateCompatibilityPDF(data as any)
    writeFileSync("test-compatibility.pdf", buffer)
    console.log("PDF generated successfully: test-compatibility.pdf")
  } catch (error) {
    console.error("PDF generation failed:", error)
  }
}

test()
