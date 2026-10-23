// ---------------------------------------------------------------------------
// Link extraction and simple, offline link heuristics.
// ScamShield NEVER opens, fetches or resolves a link. It only reads the text.
// ---------------------------------------------------------------------------

const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at',
  'goo.gl', 'ow.ly', 'tiny.cc', 'rebrand.ly', 'shorte.st', 'v.gd', 's.id', 't.co',
];

const RISKY_TLDS = [
  'xyz', 'top', 'click', 'live', 'online', 'site', 'icu', 'buzz', 'link', 'vip',
  'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'loan', 'win', 'shop', 'support', 'info',
];

const LURE_WORDS = [
  'kyc', 'verify', 'verification', 'update', 'secure', 'login', 'signin', 'account',
  'bank', 'reward', 'refund', 'claim', 'customs', 'parcel', 'redeliver', 'support',
  'bonus', 'prize', 'unblock', 'reactivate',
];

// Brand look-alike check. If a domain label starts with one of these names but the
// host is not one of the brand's official domains, it is flagged
// (e.g. "paytm.com.evil.xyz", "sbi-secure-login.top", "hdfcbank-kyc.com").
// Keep this list short and to official domains you are sure about.
const BRANDS = {
  sbi: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com'],
  hdfc: ['hdfcbank.com', 'hdfc.com'],
  icici: ['icicibank.com'],
  paytm: ['paytm.com'],
  phonepe: ['phonepe.com'],
  npci: ['npci.org.in'],
  uidai: ['uidai.gov.in'],
  irctc: ['irctc.co.in'],
  incometax: ['incometax.gov.in'],
  amazon: ['amazon.in', 'amazon.com', 'amazonaws.com'],
};

function isHostOrSubdomainOf(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function lookalikeBrand(host) {
  const parts = host.split('.').flatMap((label) => label.split('-'));
  for (const [brand, official] of Object.entries(BRANDS)) {
    if (!parts.some((part) => part.startsWith(brand))) continue;
    if (official.some((domain) => isHostOrSubdomainOf(host, domain))) continue;
    return brand;
  }
  return null;
}

const TLD_GROUP = [
  'com', 'in', 'net', 'org', 'co', 'me', 'ly', 'gd', 'io', 'app', 'gov', 'edu',
  'ac', 'ai', ...RISKY_TLDS,
].join('|');

// Matches http(s):// links, www. links and bare domains such as "example.xyz/path".
const URL_RE = new RegExp(
  String.raw`(?:https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+|(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:${TLD_GROUP})(?![a-z0-9-])(?:\/[^\s<>"'()]*)?)`,
  'giu'
);

function trimTrailingPunctuation(value) {
  return value.replace(/[.,;:!?…]+$/u, '');
}

export function getHost(url) {
  const withoutProtocol = url.replace(/^https?:\/\//i, '');
  const host = withoutProtocol.split(/[/?#]/)[0].toLowerCase();
  return host.replace(/:\d+$/, '');
}

export function assessLink(url) {
  const reasons = [];
  const host = getHost(url);
  const labels = host.split('.');
  const tld = labels[labels.length - 1];

  if (SHORTENERS.includes(host)) {
    reasons.push('Uses a link shortener, which hides the real destination.');
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    reasons.push('Points to a raw IP address instead of a named website.');
  }
  if (RISKY_TLDS.includes(tld)) {
    reasons.push(`Uses the domain ending ".${tld}", which official banks and government services in India rarely use.`);
  }
  if (host.startsWith('xn--') || host.includes('.xn--')) {
    reasons.push('Uses an encoded (punycode) domain that can imitate familiar names.');
  }
  const lure = LURE_WORDS.find((word) => host.includes(word));
  if (lure && (host.includes('-') || /\d/.test(host) || RISKY_TLDS.includes(tld))) {
    reasons.push(`The domain contains the word "${lure}", copying official-sounding wording.`);
  }
  const brand = lookalikeBrand(host);
  if (brand) {
    reasons.push(`The domain uses the name "${brand}" but is not one of its official websites.`);
  }
  // "xn--" is the punycode marker, not a real hyphenated name, so do not count it.
  if ((host.replace(/xn--/g, '').match(/-/g) || []).length >= 2) {
    reasons.push('The domain contains several hyphens, a common trait of look-alike sites.');
  }
  if (/^http:\/\//i.test(url)) {
    reasons.push('Uses an unencrypted http:// address.');
  }

  return { url, host, suspicious: reasons.length > 0, reasons };
}

export function extractLinks(text) {
  const found = [];
  for (const match of text.matchAll(URL_RE)) {
    const raw = trimTrailingPunctuation(match[0]);
    if (!raw || raw.length < 4) continue;
    // Skip things that look like decimal numbers or amounts ("2.5", "Rs.500").
    if (/^[\d.,]+$/.test(raw)) continue;
    found.push({ start: match.index, end: match.index + raw.length, url: raw });
  }
  return found;
}
