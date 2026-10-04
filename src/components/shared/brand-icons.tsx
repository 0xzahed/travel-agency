// Minimal inline brand marks (lucide no longer ships brand icons).
type P = { className?: string };

export const FacebookIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
  </svg>
);
export const InstagramIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const XIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M17.8 3.5h3l-6.6 7.5 7.8 9.5h-6.1l-4.8-5.9-5.5 5.9h-3l7.1-7.9L2 3.5h6.2l4.3 5.4 5.3-5.4Zm-1 15.3h1.7L7.3 5.1H5.5l11.3 13.7Z" />
  </svg>
);
export const YoutubeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);
export const LinkedinIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M6.9 8.8H3.6V20h3.3V8.8ZM5.3 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.4 13.6c0-3-1.6-4.9-4.2-4.9-1.6 0-2.6.9-3 1.6V8.8H10V20h3.3v-5.6c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3V20h3.3l-.1-6.4Z" />
  </svg>
);
export const GoogleIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9Z" />
    <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9l3.6-2.8Z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
  </svg>
);
export const AppleIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8a5 5 0 0 0-4.2 2.5c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.3 3-2.5.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-4ZM14 5.2c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-3 1.5-.6.7-1.2 1.9-1 3.1 1.1 0 2.3-.6 3-1.4Z" />
  </svg>
);

export function PaymentMarks({ className }: P) {
  const box = "grid h-7 w-11 place-items-center rounded-md bg-white ring-1 ring-black/5";
  return (
    <div className={className} aria-label="Accepted payment methods: Visa, Mastercard, American Express, PayPal, Apple Pay" role="img">
      <div className="flex flex-wrap gap-2">
        <span className={box}>
          <svg viewBox="0 0 48 16" className="h-3" aria-hidden>
            <text x="0" y="14" fontFamily="Arial Black, Arial" fontWeight="900" fontStyle="italic" fontSize="16" fill="#1A1F71">VISA</text>
          </svg>
        </span>
        <span className={box}>
          <svg viewBox="0 0 32 20" className="h-4" aria-hidden>
            <circle cx="12" cy="10" r="8" fill="#EB001B" />
            <circle cx="20" cy="10" r="8" fill="#F79E1B" fillOpacity=".9" />
          </svg>
        </span>
        <span className={`${box} bg-[#2E77BC]`}>
          <span className="text-[8px] font-black tracking-tight text-white">AMEX</span>
        </span>
        <span className={box}>
          <span className="text-[10px] font-extrabold italic text-[#003087]">
            Pay<span className="text-[#009CDE]">Pal</span>
          </span>
        </span>
        <span className={box}>
          <span className="flex items-center text-[10px] font-semibold text-black">
            <AppleIcon className="size-3" />
            Pay
          </span>
        </span>
      </div>
    </div>
  );
}
