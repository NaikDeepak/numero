---
status: investigating
trigger: "Investigate TypeError: Key for the RS256 algorithm must be one of type KeyObject, CryptoKey, or JSON Web Key. Received an instance of Uint8Array in src/auth/get-auth-user.ts"
created: 2026-02-02T07:09:51Z
updated: 2026-02-02T07:09:51Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: `next-firebase-auth-edge` is using `cookieSignatureKeys` (symmetric keys, converted to Uint8Array) to verify a token with `alg: RS256`, causing the type mismatch error in `jose`.
test: Inspect `verifyCustomJWT` and `RotatingCredential` in `next-firebase-auth-edge` to see which keys are used for verification.
expecting: Evidence that `cookieSignatureKeys` are being passed to `jwtVerify` when the token header specifies RS256.
next_action: Read `node_modules/next-firebase-auth-edge/lib/auth/custom-token/index.js` and `node_modules/next-firebase-auth-edge/lib/auth/rotating-credential.js`.

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Auth tokens should be verified successfully or rejected gracefully.
actual: TypeError: Key for the RS256 algorithm must be one of type KeyObject, CryptoKey, or JSON Web Key. Received an instance of Uint8Array.
errors: 
  - TypeError: Key for the RS256 algorithm must be one of type KeyObject, CryptoKey, or JSON Web Key. Received an instance of Uint8Array
reproduction: 
  - Reported in src/auth/get-auth-user.ts
  - Reproduced with `repro-auth.ts` even when passing a valid PEM string private key.
started: Unknown
context: 
  - next-firebase-auth-edge is used.
  - cookieSignatureKeys are provided (strings).
  - serviceAccount.privateKey is provided (PEM string).

## Eliminated
<!-- APPEND only - prevents re-investigating -->
- hypothesis: The private key format was invalid (Uint8Array vs String).
  evidence: Reproduced the error even when passing a valid PEM string private key. The error seems to persist regardless of private key format, suggesting the *wrong key* is being used for verification.

## Evidence
<!-- APPEND only - facts discovered -->
- `repro-auth.ts` reproduces the error with `alg: RS256` token and valid PEM private key.
- The error comes from `jose` library's `asymmetricTypeCheck`.
- Stack trace points to `verifyCustomJWT` and `RotatingCredential.verify`.
- `cookieSignatureKeys` are strings, which `jose` likely treats as Uint8Array (symmetric keys).

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: 
fix: 
verification: 
files_changed: []
