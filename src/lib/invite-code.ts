const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateInviteCode(length = 7): string {
  let result = ""
  const alphabetLength = INVITE_ALPHABET.length
  
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += INVITE_ALPHABET[randomValues[i] % alphabetLength]
    }
  } else {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * alphabetLength)
      result += INVITE_ALPHABET[randomIndex]
    }
  }

  return result
}
