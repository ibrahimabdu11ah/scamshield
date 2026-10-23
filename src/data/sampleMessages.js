// ---------------------------------------------------------------------------
// Sample messages for demos. ALL names, numbers, links and organisations are
// fictional. Do not replace them with real brands.
// ---------------------------------------------------------------------------

export const SAMPLE_MESSAGES = [
  {
    id: 'bank-kyc',
    label: 'Bank account suspension / KYC warning',
    channel: 'SMS',
    text:
      'Dear Customer, your Meridian Bank account will be SUSPENDED within 24 hours due to incomplete KYC. Update your KYC immediately at http://meridian-kyc-verify.xyz/update and enter the OTP sent to your phone to confirm. Ignore this and your account will be permanently blocked. - Meridian Bank Team',
  },
  {
    id: 'internship-fee',
    label: 'Fake internship registration fee',
    channel: 'WhatsApp',
    text:
      'Congratulations! You have been selected for the Data Analyst Internship at Nexora Global. Your internship is confirmed. Pay ₹2,500 registration fee today or your slot will be cancelled. Contact us on Telegram only: @nexora_hr_desk. Seats are limited.',
  },
  {
    id: 'legit-delivery',
    label: 'Routine delivery notification (legitimate-looking)',
    channel: 'SMS',
    text:
      'Hi Priya, your order #48213 from Northwind Store was delivered today at 2:14 PM. You can view the delivery photo or request a return from the Orders section of the Northwind app. Northwind will never ask you to share your OTP, PIN or bank details.',
  },
  {
    id: 'hindi-kyc',
    label: 'Hindi: account block threat with OTP request',
    channel: 'SMS',
    text:
      'प्रिय ग्राहक, आपका बैंक खाता आज रात बंद हो जाएगा। तुरंत KYC अपडेट करें और OTP भेजें: http://kyc-sahayata.top/form',
  },
  {
    id: 'family-emergency',
    label: 'Family emergency on a new number',
    channel: 'WhatsApp',
    text:
      "Ammi it's me, I lost my phone, this is my new number. I'm in trouble at the hospital, please transfer ₹18,000 to this UPI immediately. Don't tell papa, I'll explain later.",
  },
];

// The illustrative example shown on the Overview page.
export const ILLUSTRATIVE_EXAMPLE = SAMPLE_MESSAGES[1];

// Transcript of the bundled sample screenshot (public/samples/sample-sms-screenshot.png).
// Used as a demo fallback if OCR cannot run (for example, no internet for the
// OCR language files).
export const SAMPLE_SCREENSHOT = {
  src: `${(import.meta.env && import.meta.env.BASE_URL) || "./"}samples/sample-sms-screenshot.png`,
  transcript:
    'SwiftParcel: Your parcel is on hold at our facility due to unpaid customs fee of Rs.49. Pay within 12 hours or it will be returned to sender. Pay now: http://swiftparcel-redeliver.top/pay',
};
