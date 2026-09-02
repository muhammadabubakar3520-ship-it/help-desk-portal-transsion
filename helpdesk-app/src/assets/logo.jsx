export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#005BAC" />
      <path
        d="M8 22.5V9.5H16.4C19.5 9.5 21.6 11.2 21.6 14C21.6 16.3 20.2 17.8 18.1 18.4L22 22.5H18.6L15.1 18.7H10.9V22.5H8ZM10.9 16.2H16.1C17.9 16.2 18.9 15.4 18.9 14C18.9 12.6 17.9 11.8 16.1 11.8H10.9V16.2Z"
        fill="white"
      />
      <circle cx="24.5" cy="8.5" r="2.3" fill="#00A3E0" />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-display leading-none ${className}`}>
      <span className="font-bold tracking-tight">TRANSSION</span>{' '}
      <span className="font-medium text-brand-accent">HOLDINGS</span>
    </span>
  )
}
