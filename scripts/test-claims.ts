import { setUserPremiumStatus, getUserClaims } from "../src/lib/auth/roles"

// This script is intended to be run with tsx or ts-node
// Usage: npx tsx scripts/test-claims.ts <uid> <true|false>

async function main() {
  const uid = process.argv[2]
  const status = process.argv[3] === "true"

  if (!uid) {
    console.error("Please provide a UID")
    process.exit(1)
  }

  console.log(`Setting premium status for ${uid} to ${status}...`)

  try {
    await setUserPremiumStatus(uid, status)
    console.log("Success!")

    const claims = await getUserClaims(uid)
    console.log("Current claims:", claims)
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
