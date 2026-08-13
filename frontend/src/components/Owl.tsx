export function Owl({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <ellipse cx="40" cy="48" rx="26" ry="24" fill="#58CC02" />
      <ellipse cx="28" cy="36" rx="14" ry="14" fill="#89E219" />
      <ellipse cx="52" cy="36" rx="14" ry="14" fill="#89E219" />
      <circle cx="28" cy="36" r="8" fill="#fff" />
      <circle cx="52" cy="36" r="8" fill="#fff" />
      <circle cx="30" cy="37" r="3.5" fill="#4B4B4B" />
      <circle cx="50" cy="37" r="3.5" fill="#4B4B4B" />
      <path d="M36 48 L40 56 L44 48 Z" fill="#FF9600" />
      <ellipse cx="22" cy="62" rx="7" ry="4" fill="#46A302" />
      <ellipse cx="58" cy="62" rx="7" ry="4" fill="#46A302" />
    </svg>
  );
}
