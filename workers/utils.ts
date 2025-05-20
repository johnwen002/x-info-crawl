// Helper function to convert ArrayBuffer to Hex String (remains the same)
function bufferToHexString(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexParts: string[] = [];
  for (let i = 0; i < byteArray.length; i++) {
    const hex = byteArray[i].toString(16);
    const paddedHex = hex.padStart(2, "0");
    hexParts.push(paddedHex);
  }
  return hexParts.join("");
}

/**
 * Calculates the hash of a string using the specified algorithm.
 * @param algorithm The hashing algorithm name as a string (e.g., 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512').
 *                  It's case-sensitive according to Web Crypto spec, often uppercase like 'SHA-256'.
 * @param inputString The string to hash.
 * @returns A Promise resolving to the hexadecimal hash string.
 */
// FIX: Changed AlgorithmIdentifier to string
export async function calculateStringHash(inputString: string): Promise<string> {
  // 1. Encode the string into an ArrayBuffer using UTF-8 encoding
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);

  // 2. Calculate the digest using Web Crypto API
  // We need to cast algorithm to AlgorithmIdentifier if strict type checking requires it,
  // but often just passing the string works directly with the JS implementation.
  // For clarity and potential type safety if the underlying types *are* loaded,
  // you can use 'as AlgorithmIdentifier', but 'string' is often sufficient for the function signature.
  const hashBuffer = await crypto.subtle.digest("SHA-256", data); // Cast if needed, or often just algorithm works
  // Or more simply, rely on JS flexibility:
  // const hashBuffer = await crypto.subtle.digest(algorithm, data);

  // 3. Convert the ArrayBuffer result to a Hex string
  const hashString = bufferToHexString(hashBuffer);

  return hashString;
}
