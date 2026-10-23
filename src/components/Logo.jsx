// ScamShield wordmark: a simple original shield-and-lens mark.
export default function Logo({ inverse = true }) {
  return (
    <span className={`logo ${inverse ? 'logo--inverse' : ''}`}>
      <svg className="logo__mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path
          d="M16 2.5 4.5 6.8v8.4c0 7.2 4.9 12.6 11.5 14.3 6.6-1.7 11.5-7.1 11.5-14.3V6.8L16 2.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="15" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m18.4 18.4 3.6 3.6" stroke="#4fb3aa" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="logo__word">
        Scam<span>Shield</span>
      </span>
    </span>
  );
}
