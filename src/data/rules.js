// ---------------------------------------------------------------------------
// ScamShield rule catalogue (deterministic).
//
// Each rule:
//   id           Stable identifier shown to users in the X-Ray panel.
//   tactic       Key from tactics.js.
//   severity     1 = weak signal, 2 = moderate, 3 = strong.
//   lang         'en', 'hi' (Devanagari Hindi) or 'hinglish' (Hindi in Latin script).
//   categories   Which scam category this signal points towards, with a weight.
//   negationGuard  If true, a match is ignored when it is preceded by words like
//                "never" or "do not" (e.g. "we will never ask you to share your OTP").
//   patterns     Regular expressions. Always case-insensitive. The analyzer adds
//                the global flag itself.
//
// NOTE: rules run on a normalised match view (NFKC, zero-width characters removed,
// single line breaks turned into spaces) - see buildMatchView in analyzer.js.
//
// IMPORTANT: Hindi (Devanagari) patterns must NOT use \b, because JavaScript's
// \b only understands English letters.
//
// To add a rule: copy an existing entry, give it a new unique id, and add a
// test case in src/utils/analyzer.test.js.
// ---------------------------------------------------------------------------

export const CATEGORY_LABELS = {
  bank_kyc: 'Bank / KYC suspension',
  job_fee: 'Job or internship fee',
  delivery_fee: 'Delivery / customs fee',
  family_emergency: 'Family emergency impersonation',
  prize_reward: 'Prize, refund or reward',
  investment_task: 'Investment or task-earning offer',
  authority_threat: 'Authority / legal threat',
  tech_support: 'Remote-access / tech support',
  utility_bill: 'Electricity / utility disconnection',
  blackmail: 'Blackmail / sextortion',
  general: 'General suspicious message',
  unclassified: 'No specific pattern',
};

const MONEY = String.raw`(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;
const AMOUNT = String.raw`(?:(?:rs\.?|inr|₹)\s?)?[\d,]+(?:\.\d+)?(?:\s?\/-)?`;

export const RULES = [
  // ----------------------------------------------------------------- Urgency
  {
    id: 'URG-01',
    tactic: 'urgency',
    severity: 3,
    lang: 'en',
    categories: { general: 1 },
    description: 'Deadline combined with a consequence',
    patterns: [
      /\b(?:today|tonight|now|immediately|right away|within \d+\s?(?:hours?|hrs?|minutes?|mins?|days?))\b,?\s+(?:or|else|otherwise)\s+[^.!?\n]{0,60}?\b(?:cancel+ed|blocked|suspended|deactivated|closed|terminated|frozen|forfeited|lost|disconnected|expire[sd]?|rejected|returned|sent back|destroyed)\b/iu,
    ],
  },
  {
    id: 'URG-02',
    tactic: 'urgency',
    severity: 2,
    lang: 'en',
    categories: { general: 1 },
    description: 'Time-pressure wording',
    patterns: [
      /\b(?:immediately|urgent(?:ly)?|right now|asap|act now|respond now|last chance|final (?:notice|warning|reminder)|before it['’]?s too late|limited time only)\b/iu,
      /\bwithin\s+(?:the\s+next\s+)?\d+\s?(?:hours?|hrs?|minutes?|mins?)\b/iu,
      /\b(?:expires?|expiring|valid)\s+(?:today|tonight|in\s+\d+\s?(?:hours?|hrs?|minutes?|mins?))\b/iu,
    ],
  },
  {
    id: 'URG-03',
    tactic: 'urgency',
    severity: 1,
    lang: 'en',
    categories: { general: 1 },
    description: 'Scarcity wording',
    patterns: [
      /\b(?:seats|slots|spots|places|vacancies) (?:are )?(?:limited|filling fast)\b/iu,
      /\bonly \d+ (?:seats|slots|spots|places) (?:left|remaining)\b/iu,
    ],
  },
  {
    id: 'URG-HI',
    tactic: 'urgency',
    severity: 2,
    lang: 'hi',
    categories: { general: 1 },
    description: 'Time pressure (Hindi)',
    patterns: [/(?:तुरंत|तुरन्त|फौरन|अभी तुरंत|आज ही|जल्दी करें|जल्द से जल्द|\d+\s?घंटे (?:के अंदर|में))/u],
  },
  {
    id: 'URG-HG',
    tactic: 'urgency',
    severity: 2,
    lang: 'hinglish',
    categories: { general: 1 },
    description: 'Time pressure (Hinglish)',
    patterns: [/\b(?:turant|fauran|jaldi karo|jaldi karein|aaj hi|abhi ke abhi)\b/iu],
  },

  // ------------------------------------------------------------------ Threat
  {
    id: 'THR-01',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of suspension or blocking',
    patterns: [
      /\b(?:account|card|sim|mobile number|number|kyc|service|wallet|upi|pan|aadhaar)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:suspended|blocked|deactivated|closed|frozen|terminated|disconnected|cancel+ed|barred|cut)\b/iu,
    ],
  },
  {
    id: 'THR-03',
    tactic: 'threat',
    severity: 2,
    lang: 'en',
    categories: { utility_bill: 3, general: 1 },
    description: 'Threat to cut electricity, gas, water or another connection',
    patterns: [
      /\b(?:electricity|power|power supply|light|gas|water|internet|broadband|connection|meter)\b[^.!?\n]{0,30}?\b(?:will be|is being|has been|shall be|is going to be|gets?)\s+(?:permanently\s+|temporarily\s+)?(?:disconnected|cut(?: off)?|suspended|blocked|stopped|terminated|deactivated)\b/iu,
    ],
  },
  {
    id: 'THR-02',
    tactic: 'threat',
    severity: 3,
    lang: 'en',
    categories: { authority_threat: 3 },
    description: 'Legal or arrest threat',
    patterns: [
      /\b(?:arrest warrant|digital arrest|legal action|fir (?:has been|will be) (?:registered|filed)|case (?:has been|will be) (?:registered|filed)|you will be arrested|money laundering case)\b/iu,
    ],
  },
  {
    id: 'THR-HI',
    tactic: 'threat',
    severity: 2,
    lang: 'hi',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Hindi)',
    patterns: [
      /(?:खाता|अकाउंट|सिम|कार्ड|नंबर|बिजली|कनेक्शन)[^।.!?\n]{0,25}?(?:बंद|ब्लॉक|निलंबित|सस्पेंड)\s?(?:हो जाएगा|हो जायेगा|कर दिया जाएगा|किया जाएगा|हो जाएगी|कर दी जाएगी)/u,
      /(?:गिरफ्तार|गिरफ़्तार|कानूनी कार्रवाई)/u,
    ],
  },
  {
    id: 'THR-HG',
    tactic: 'threat',
    severity: 2,
    lang: 'hinglish',
    categories: { bank_kyc: 2, general: 1 },
    description: 'Threat of blocking (Hinglish)',
    patterns: [/\b(?:account|khata|sim|card|number)\b[^.!?\n]{0,20}?\b(?:band|block)\s+(?:ho jayega|ho jaega|kar diya jayega|kar dia jayega)\b/iu],
  },

  // -------------------------------------------------------------- Upfront fee
  {
    id: 'FEE-01',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'en',
    categories: { job_fee: 2, delivery_fee: 1 },
    description: 'Payment demanded to secure or release something',
    patterns: [
      new RegExp(
        String.raw`\bpay\s+(?:a\s+|the\s+|only\s+|just\s+)?${AMOUNT}\s*(?:as\s+)?(?:a\s+|the\s+)?(?:refundable\s+)?(?:registration|processing|joining|security|verification|training|documentation|onboarding|customs|clearance|redelivery|release|handling|activation|application)\s+(?:fees?|charges?|deposit|amount)\b`,
        'iu'
      ),
      new RegExp(
        String.raw`\b(?:pay|deposit|send|transfer|submit|remit)\b[^.!?\n]{0,30}?\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:fees?|charges?)\b`,
        'iu'
      ),
      new RegExp(
        String.raw`\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:fees?|charges?)\s*(?:of|:|-|is|are|=)?\s*${MONEY}`,
        'iu'
      ),
      /\bsecurity deposit\b/iu,
    ],
  },
  {
    id: 'FEE-03',
    tactic: 'advance_fee',
    severity: 2,
    lang: 'en',
    categories: { job_fee: 1 },
    description: 'Mentions a registration or processing fee (weak on its own)',
    patterns: [
      /\b(?:registration|processing|joining|training kit|onboarding|documentation|application|activation)\s+(?:fees?|charges?)\b/iu,
    ],
  },
  {
    id: 'FEE-02',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'en',
    categories: { delivery_fee: 3 },
    description: 'Fee to release a parcel',
    patterns: [
      /\b(?:customs|clearance|redelivery|re-delivery|address update|delivery|handling)\s+(?:fee|charge|duty|amount)\s+(?:of\s+)?(?:(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d+)?)/iu,
      /\b(?:parcel|package|shipment|consignment)\b[^.!?\n]{0,40}?\b(?:on hold|held|pending|returned|could not be delivered|undelivered)\b/iu,
    ],
  },
  {
    id: 'FEE-HI',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'hi',
    categories: { job_fee: 2 },
    description: 'Upfront fee (Hindi)',
    patterns: [/(?:रजिस्ट्रेशन|पंजीकरण|प्रोसेसिंग|प्रक्रिया)\s?(?:फीस|शुल्क)/u, /(?:शुल्क|फीस)\s?(?:जमा करें|भरें|का भुगतान करें)/u],
  },
  {
    id: 'FEE-HG',
    tactic: 'advance_fee',
    severity: 3,
    lang: 'hinglish',
    categories: { job_fee: 2 },
    description: 'Upfront fee (Hinglish)',
    patterns: [/\b(?:registration|processing|joining)\s+(?:fees?|charge)\s+(?:bharo|bharein|jama karo|jama karein|dena hoga|deni hogi)\b/iu],
  },

  // -------------------------------------------------------- Credential request
  {
    id: 'CRD-01',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'Asks you to share an OTP, PIN, password or CVV',
    patterns: [
      /\b(?:share|send|provide|enter|tell|confirm|give|forward|reply with|submit|read out|type)\b[^.!?\n]{0,35}?\b(?:o\s?t\s?p|0\s?t\s?p|one[- ]time password|upi pin|atm pin|pin|password|passcode|c\s?v\s?v|card details|net ?banking (?:id|password|credentials))\b/iu,
    ],
  },
  {
    id: 'CRD-02',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'Asks you to forward the verification code you received',
    patterns: [
      /\b(?:send|forward|share|tell|read out|give|reply with)\b[^.!?\n]{0,25}?\b(?:the|that|this|your)\s+(?:\d{4,8}[- ]digit\s+)?(?:verification |security |confirmation )?code\b[^.!?\n]{0,30}?\b(?:received|sent|just got|on your phone|by sms|via sms)\b/iu,
    ],
  },
  {
    id: 'CRD-03',
    tactic: 'credential_request',
    severity: 3,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 2, general: 1 },
    description: 'States that your card or login details are "required"',
    patterns: [
      /\b(?:card (?:details|number|information)|cvv|net ?banking (?:details|credentials)|upi pin|atm pin)\b[^.!?\n]{0,25}?\b(?:is|are) (?:required|needed|necessary|mandatory)\b/iu,
      /\b(?:require|requires|required|need|needs|needed)\s+your\b[^.!?\n]{0,15}?\b(?:card details|card number|cvv|pin|password|otp)\b/iu,
    ],
  },
  {
    id: 'CRD-HI',
    tactic: 'credential_request',
    severity: 3,
    lang: 'hi',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Hindi)',
    patterns: [/(?:OTP|ओटीपी|पिन|PIN|पासवर्ड)[^।.!?\n]{0,15}?(?:भेजें|भेजो|बताएं|बताएँ|बताओ|शेयर करें|दें|दीजिए)/iu],
  },
  {
    id: 'CRD-HG',
    tactic: 'credential_request',
    severity: 3,
    lang: 'hinglish',
    negationGuard: true,
    categories: { bank_kyc: 2 },
    description: 'Asks for OTP / PIN (Hinglish)',
    patterns: [/\b(?:otp|pin|password)\b[^.!?\n]{0,15}?\b(?:bhejo|bhejein|batao|bataiye|share karo|share karein|de do|dijiye)\b/iu],
  },

  // ---------------------------------------------------- Verification pretext
  {
    id: 'PRT-01',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'en',
    negationGuard: true,
    categories: { bank_kyc: 3 },
    description: 'KYC / account verification request',
    patterns: [
      /\b(?:update|complete|verify|re-?verify|link|renew|submit)\s+(?:your\s+)?(?:e-?kyc|kyc|pan(?: card)?|aadhaar|account details|bank details)\b/iu,
      /\b(?:kyc|pan|aadhaar)\b[^.!?\n]{0,20}?\b(?:incomplete|pending|expired|not updated|not verified)\b/iu,
    ],
  },
  {
    id: 'PRT-HI',
    tactic: 'verification_pretext',
    severity: 2,
    lang: 'hi',
    categories: { bank_kyc: 3 },
    description: 'KYC update request (Hindi)',
    patterns: [/(?:KYC|केवाईसी|पैन|आधार)\s?(?:अपडेट|अपडेट करें|सत्यापित करें|पूरा करें|लंबित)/iu],
  },

  // ------------------------------------------------------------ Impersonation
  {
    id: 'IMP-01',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { authority_threat: 2 },
    description: 'Claims to be police, a regulator or a government body',
    patterns: [
      /\b(?:rbi|reserve bank|cbi|police|cyber cell|cyber crime (?:department|cell)|customs department|income tax department|trai|narcotics|enforcement directorate)\b/iu,
    ],
  },
  {
    id: 'IMP-02',
    tactic: 'impersonation',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 3 },
    description: 'Claims to be a family member on a new number',
    patterns: [
      /\b(?:this is (?:your )?(?:son|daughter|brother|sister|mom|mum|dad|beta|uncle|aunty|cousin))\b/iu,
      /\b(?:my|this is my) new number\b/iu,
      /\b(?:mom|mum|maa|ammi|dad|papa|abba|abbu|bhai|didi)\b[,!]?\s+(?:it['’]?s me|this is me|i lost my phone)/iu,
    ],
  },
  {
    id: 'IMP-HI',
    tactic: 'impersonation',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 3 },
    description: 'Family member on a new number (Hindi)',
    patterns: [/(?:मेरा नया नंबर|मैं आपका बेटा|मैं आपकी बेटी|पापा मैं|मम्मी मैं)/u],
  },

  // -------------------------------------------------------- Channel switching
  {
    id: 'CHN-01',
    tactic: 'channel_switch',
    severity: 2,
    lang: 'en',
    categories: { job_fee: 1, general: 1 },
    description: 'Pushes conversation to Telegram, WhatsApp or a personal number',
    patterns: [
      /\b(?:contact|message|reach|text|chat with|connect with|ping|dm|call)\s+(?:us|me|our [a-z]+|the [a-z]+)?\s*(?:on|via|through|at)\s+(?:telegram|whatsapp|signal|this number|my personal number)(?:\s+only)?\b/iu,
      /\b(?:telegram|whatsapp) only\b/iu,
      /\bjoin\s+(?:our|my|the|this)\s+(?:telegram|whatsapp)\s+(?:group|channel)\b/iu,
    ],
  },

  // ------------------------------------------------------------ Reward bait
  {
    id: 'RWD-01',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'en',
    categories: { prize_reward: 3 },
    description: 'Unexpected prize, lottery or cashback',
    patterns: [
      /\b(?:you have won|you've won|you won|lucky winner|lottery|jackpot|claim your (?:prize|reward|cashback|refund)|cashback of|reward points? (?:worth|expir))\b/iu,
    ],
  },
  {
    id: 'RWD-02',
    tactic: 'reward_bait',
    severity: 1,
    lang: 'en',
    categories: { job_fee: 2 },
    description: 'Unsolicited selection or offer',
    patterns: [
      /\b(?:you have been|you've been|you are)\s+(?:shortlisted|selected)\b/iu,
      /\b(?:internship|job|offer) (?:is )?confirmed\b/iu,
    ],
  },
  {
    id: 'RWD-HI',
    tactic: 'reward_bait',
    severity: 2,
    lang: 'hi',
    categories: { prize_reward: 3 },
    description: 'Prize or lottery (Hindi)',
    patterns: [/(?:लॉटरी|इनाम जीत|आपने जीता|आपने जीते|कैशबैक)/u],
  },

  // --------------------------------------------------------------- Secrecy
  {
    id: 'SEC-01',
    tactic: 'secrecy',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 1, authority_threat: 1 },
    description: 'Asks you to keep it secret',
    patterns: [
      /\b(?:don['’]?t|do not) (?:tell|inform|share this with) (?:anyone|anybody|your family|papa|mom|dad|the bank)\b/iu,
      /\bkeep (?:this|it) (?:confidential|secret|between us)\b/iu,
    ],
  },
  {
    id: 'SEC-HI',
    tactic: 'secrecy',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 1 },
    description: 'Secrecy (Hindi)',
    patterns: [/(?:किसी को (?:मत|न) (?:बताना|बताएं|बताइए))/u],
  },

  // ------------------------------------------------------ Emotional pressure
  {
    id: 'EMO-01',
    tactic: 'emotional_pressure',
    severity: 2,
    lang: 'en',
    categories: { family_emergency: 3 },
    description: 'Emergency story asking for money',
    patterns: [
      /\b(?:i['’]?m|i am|he is|she is|your (?:son|daughter)(?: is)?) (?:in (?:trouble|hospital|police custody)|stuck|arrested|in an accident|had an accident)\b/iu,
    ],
  },
  {
    id: 'EMO-02',
    tactic: 'emotional_pressure',
    severity: 3,
    lang: 'en',
    categories: { family_emergency: 2 },
    description: 'Urgent request to send money',
    patterns: [
      new RegExp(
        String.raw`\b(?:send|transfer)\s+(?:me\s+)?(?:the\s+)?(?:money|amount|${MONEY})[^.!?\n]{0,30}?\b(?:urgently|now|immediately|asap)\b`,
        'iu'
      ),
    ],
  },
  {
    id: 'EMO-HI',
    tactic: 'emotional_pressure',
    severity: 2,
    lang: 'hi',
    categories: { family_emergency: 3 },
    description: 'Emergency story (Hindi)',
    patterns: [/(?:मुसीबत में|अस्पताल में|एक्सीडेंट|दुर्घटना|पैसे भेजो|पैसे भेज दो|पैसे भेजें)/u],
  },

  // ------------------------------------------------------------ Remote access
  {
    id: 'RMT-01',
    tactic: 'remote_access',
    severity: 3,
    lang: 'en',
    categories: { tech_support: 3 },
    description: 'Asks you to install a remote-access app or share your screen',
    patterns: [/\b(?:anydesk|teamviewer|quicksupport|rustdesk|screen ?share|share your screen|remote access app)\b/iu],
  },

  // ---------------------------------------------------------- Payment redirect
  {
    id: 'PAY-01',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'en',
    categories: { prize_reward: 2, general: 1 },
    description: 'Scan or enter PIN to "receive" money',
    patterns: [
      /\b(?:scan|enter (?:your )?(?:upi )?pin)\b[^.!?\n]{0,30}?\bto (?:receive|get|claim|accept)\b/iu,
    ],
  },
  {
    id: 'PAY-02',
    tactic: 'payment_redirect',
    severity: 2,
    lang: 'en',
    categories: { general: 1 },
    description: 'Payment to a personal UPI ID, QR code or gift card',
    patterns: [
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,30}?\b(?:to (?:this|the following|my) (?:upi|upi id|account|number|qr)|via (?:this )?qr|on (?:this )?upi)\b/iu,
      /\b(?:gift ?cards?|google play cards?|amazon pay cards?)\b/iu,
    ],
  },
  {
    id: 'PAY-03',
    tactic: 'payment_redirect',
    severity: 3,
    lang: 'en',
    categories: { general: 1 },
    description: 'Asks you to buy gift cards or send their codes',
    patterns: [
      /\b(?:buy|purchase|send|share|scratch)\b[^.!?\n]{0,30}?\b(?:gift ?cards?|google play cards?|amazon pay cards?|itunes cards?|steam cards?)\b/iu,
      /\b(?:gift ?cards?|google play cards?)\b[^.!?\n]{0,40}?\b(?:send|share|read out|tell|give)\b[^.!?\n]{0,15}?\b(?:codes?|pins?|numbers?)\b/iu,
    ],
  },

  // --------------------------------------------------------- Unrealistic offer
  {
    id: 'OFR-01',
    tactic: 'unrealistic_offer',
    severity: 2,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Easy daily earnings or paid "simple tasks"',
    patterns: [
      new RegExp(String.raw`\b(?:earn|income of|make)\s+(?:up to\s+)?${MONEY}\s*(?:per|a|\/)\s*(?:day|daily|hour)\b`, 'iu'),
      /\b(?:like (?:youtube )?videos|rate (?:hotels|products)|simple online tasks?)\b[^.!?\n]{0,40}?\b(?:earn|paid|income)\b/iu,
    ],
  },
  {
    id: 'OFR-02',
    tactic: 'unrealistic_offer',
    severity: 3,
    lang: 'en',
    categories: { investment_task: 3 },
    description: 'Guaranteed returns or money-doubling scheme',
    patterns: [
      /\b(?:guaranteed\s+(?:[\w%.]+\s+){0,2}?(?:returns?|profits?|income)|assured\s+(?:[\w%.]+\s+){0,2}?returns?|\d+(?:\.\d+)?\s?x\s+(?:returns?|profits?|your money)|double your money|risk[- ]free (?:returns?|profit)|\d+% (?:daily|weekly) returns?|100% (?:safe|guaranteed|secure|risk[- ]free))\b/iu,
      new RegExp(String.raw`\b(?:invest|deposit)\s+${AMOUNT}\s+(?:and\s+)?(?:get|receive|earn)\s+${AMOUNT}\s+(?:back|in return|profit)`, 'iu'),
    ],
  },

  // --------------------------------------------------------------- Blackmail
  {
    id: 'EXT-01',
    tactic: 'blackmail',
    severity: 3,
    lang: 'en',
    categories: { blackmail: 3, general: 1 },
    description: 'Threatens to leak private photos, videos or chats unless you pay',
    patterns: [
      /\bi (?:have|will)\b[^.!?\n]{0,25}?\b(?:recorded|leak|expose|upload)\b[^.!?\n]{0,40}?\b(?:your (?:video|videos|photos?|pictures?|chats?)|your contacts|all your contacts|your family)\b/iu,
      /\b(?:pay|send|transfer)\b[^.!?\n]{0,40}?\b(?:or|otherwise|else)\b[^.!?\n]{0,25}?\b(?:leak|expose|post|share|upload|send)\b[^.!?\n]{0,30}?\b(?:contacts|friends|family|relatives|social media|online|public)\b/iu,
    ],
  },

  // ---------------------------------------------------------- Generic greeting
  {
    id: 'GEN-01',
    tactic: 'generic_greeting',
    severity: 1,
    lang: 'en',
    categories: { general: 0 },
    description: 'Generic greeting (weak signal)',
    patterns: [/\b(?:dear (?:customer|user|sir\/madam|account ?holder|valued customer)|valued customer)\b/iu],
  },
  {
    id: 'GEN-HI',
    tactic: 'generic_greeting',
    severity: 1,
    lang: 'hi',
    categories: { general: 0 },
    description: 'Generic greeting (Hindi, weak signal)',
    patterns: [/(?:प्रिय ग्राहक|प्रिय उपभोक्ता)/u],
  },
];
