export type Lang = 'en' | 'hi'

const S = {
  appTitle: { en: 'SafeHer UP', hi: 'सेफ़हर यूपी' },
  tagline: {
    en: 'Your safety companion across Uttar Pradesh',
    hi: 'उत्तर प्रदेश में आपकी सुरक्षा साथी',
  },
  navMap: { en: 'Map', hi: 'मानचित्र' },
  navRoutes: { en: 'Routes', hi: 'मार्ग' },
  navJourney: { en: 'Journey', hi: 'यात्रा' },
  navHelp: { en: 'Help', hi: 'मदद' },
  city: { en: 'City', hi: 'शहर' },
  reportIncident: { en: 'Report incident', hi: 'घटना रिपोर्ट करें' },
  incidentType: { en: 'Incident type', hi: 'घटना प्रकार' },
  timeOfIncident: { en: 'Time', hi: 'समय' },
  now: { en: 'Now', hi: 'अभी' },
  customTime: { en: 'Custom', hi: 'अन्य समय' },
  description: { en: 'Description (optional)', hi: 'विवरण (वैकल्पिक)' },
  anonymous: { en: 'Submit anonymously', hi: 'गुमनाम रूप से भेजें' },
  submit: { en: 'Submit', hi: 'जमा करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  routesTitle: { en: 'Safe route planner', hi: 'सुरक्षित मार्ग योजना' },
  routesSubtitle: {
    en: 'Compare safety scores — we avoid high-risk areas where possible.',
    hi: 'सुरक्षा स्कोर की तुलना — हम उच्च जोखिम क्षेत्रों से बचने का प्रयास करते हैं।',
  },
  start: { en: 'Start', hi: 'प्रारंभ' },
  destination: { en: 'Destination', hi: 'गंतव्य' },
  searchOrTap: {
    en: 'Search or tap map to set points',
    hi: 'खोजें या मानचित्र पर टैप करें',
  },
  planRoutes: { en: 'Plan routes', hi: 'मार्ग बनाएं' },
  planning: { en: 'Planning…', hi: 'योजना बन रही है…' },
  safestRoute: { en: 'Safest route', hi: 'सबसे सुरक्षित मार्ग' },
  fastestRoute: { en: 'Fastest route', hi: 'सबसे तेज़ मार्ग' },
  alternateRoute: { en: 'Alternate', hi: 'वैकल्पिक' },
  eta: { en: 'Est. time', hi: 'अनुमानित समय' },
  safetyScore: { en: 'Safety', hi: 'सुरक्षा' },
  riskZonesCrossed: { en: 'Risk zones crossed', hi: 'जोखिम क्षेत्र पार' },
  crossesDanger: {
    en: 'Crosses higher-risk areas — use with caution.',
    hi: 'उच्च जोखिम क्षेत्रों से गुजरता है — सावधानी से उपयोग करें।',
  },
  journeyTitle: { en: 'Journey tracker', hi: 'यात्रा ट्रैकर' },
  journeySubtitle: {
    en: 'Share your plan. We’ll remind you to check in — and alert contacts if you don’t.',
    hi: 'अपनी योजना साझा करें। हम चेक-इन की याद दिलाएंगे — और यदि नहीं तो संपर्कों को सूचित करेंगे।',
  },
  destLabel: { en: 'Destination (area or landmark)', hi: 'गंतव्य (क्षेत्र या स्थल)' },
  expectedArrival: { en: 'Expected arrival', hi: 'अपेक्षित आगमन' },
  contacts: { en: 'Emergency contacts (up to 3)', hi: 'आपातकालीन संपर्क (३ तक)' },
  name: { en: 'Name', hi: 'नाम' },
  phone: { en: 'Phone', hi: 'फ़ोन' },
  startJourney: { en: 'Start journey', hi: 'यात्रा शुरू करें' },
  journeyActive: { en: 'Journey active', hi: 'यात्रा सक्रिय' },
  imSafe: { en: "I'm safe", hi: 'मैं सुरक्षित हूँ' },
  sos: { en: 'SOS alert', hi: 'एसओएस अलर्ट' },
  checkInWarning: {
    en: 'Check-in overdue — alert in',
    hi: 'चेक-इन बाकी — अलर्ट में',
  },
  destinationReached: {
    en: 'Reached destination?',
    hi: 'गंतव्य पर पहुँच गईं?',
  },
  helpTitle: { en: 'Help & helplines', hi: 'मदद और हेल्पलाइन' },
  helpIntro: {
    en: 'Save these numbers. SafeHer UP does not replace emergency services.',
    hi: 'इन नंबरों को सहेजें। सेफ़हर यूपी आपातकालीन सेवाओं का विकल्प नहीं है।',
  },
  language: { en: 'Language', hi: 'भाषा' },
  english: { en: 'English', hi: 'अंग्रेज़ी' },
  hindi: { en: 'Hindi', hi: 'हिंदी' },
  harassment: { en: 'Harassment', hi: 'उत्पीड़न' },
  unsafeArea: { en: 'Unsafe area', hi: 'असुरक्षित क्षेत्र' },
  poorLighting: { en: 'Poor lighting', hi: 'कम रोशनी' },
  suspicious: { en: 'Suspicious person', hi: 'संदिग्ध व्यक्ति' },
  other: { en: 'Other', hi: 'अन्य' },
  tapMapSet: { en: 'Tap map to set', hi: 'सेट करने के लिए मानचित्र पर टैप करें' },
  clearPoints: { en: 'Clear points', hi: 'बिंदु साफ़ करें' },
  none: { en: 'None', hi: 'कोई नहीं' },
  min: { en: 'min', hi: 'मि' },
  pinHint: {
    en: 'Pan the map so the centre dot marks the location, then report.',
    hi: 'मानचित्र घुमाएँ ताकि केंद्र बिंदु सही जगह हो, फिर रिपोर्ट करें।',
  },
} as const

export type TKey = keyof typeof S

export function t(key: TKey, lang: Lang): string {
  return S[key][lang]
}

export const INCIDENT_LABELS: Record<
  string,
  { en: string; hi: string }
> = {
  harassment: { en: 'Harassment', hi: 'उत्पीड़न' },
  unsafe: { en: 'Unsafe area', hi: 'असुरक्षित क्षेत्र' },
  lighting: { en: 'Poor lighting', hi: 'कम रोशनी' },
  suspicious: { en: 'Suspicious person', hi: 'संदिग्ध व्यक्ति' },
  other: { en: 'Other', hi: 'अन्य' },
}
