export function normalizePhoneE164India(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.startsWith('91') && digits.length >= 12) return digits.slice(0, 12)
  return digits
}

export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export function buildAlertMessage(
  contactName: string,
  journeyDest: string,
  lat: number,
  lng: number,
  lang: 'en' | 'hi',
): string {
  const maps = mapsLink(lat, lng)
  if (lang === 'hi') {
    return `सेफ़हर यूपी अलर्ट: ${contactName} — मैं समय पर चेक-इन नहीं कर सकी। कृपया संपर्क करें। गंतव्य: ${journeyDest}. अंतिम ज्ञात स्थान: ${maps}`
  }
  return `SafeHer UP alert for ${contactName}: I did not check in on time. Please reach out. Destination: ${journeyDest}. Last known location: ${maps}`
}

export function buildMissedCheckInMessage(
  contactName: string,
  journeyDest: string,
  lat: number | undefined,
  lng: number | undefined,
  lang: 'en' | 'hi',
): string {
  const hasLoc =
    lat != null && lng != null && !(lat === 0 && lng === 0)
  const loc = hasLoc
    ? mapsLink(lat!, lng!)
    : lang === 'hi'
      ? 'स्थान अभी उपलब्ध नहीं (GPS)'
      : 'Location not available yet (GPS)'
  if (lang === 'hi') {
    return `सेफ़हर यूपी अलर्ट: ${contactName} — मैं समय पर चेक-इन नहीं कर सकी। गंतव्य: ${journeyDest}. स्थान: ${loc}`
  }
  return `SafeHer UP alert for ${contactName}: I did not check in on time. Destination: ${journeyDest}. Location: ${loc}`
}

export function whatsappUrl(phone: string, text: string): string {
  const n = normalizePhoneE164India(phone)
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}
