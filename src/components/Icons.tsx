// The Studio 11 mark: the number 11 standing inside an arched doorway,
// drawn like an architect's line sketch. Every path has pathLength="1" so the
// opening animation draws each line evenly.
export function Mark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 120 150" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} d="M14 146 V66 A46 46 0 0 1 106 66 V146" />
        <path pathLength={1} d="M26 146 V68 A34 34 0 0 1 94 68 V146" className="mark__inner" />
        <path pathLength={1} d="M44 65 L51 57 V124" />
        <path pathLength={1} d="M62 65 L69 57 V124" />
        <path pathLength={1} d="M45 124 H57 M63 124 H75" />
        <path pathLength={1} d="M2 146 H118" />
      </g>
    </svg>
  );
}

type IconProps = { className?: string };

export function PhoneIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.7 3.5h2.5l1.5 3.7-1.9 1.3a11.5 11.5 0 0 0 6.7 6.7l1.3-1.9 3.7 1.5v2.5a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.7 5.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.1 7.9c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.3l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.6 1 1.4 1.8 2.4 2.3.2.1.4.1.5-.1l.6-.7c.1-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .7-.4 1.4-1 1.7-.6.3-1.3.3-2 .1-2.6-.8-4.6-2.8-5.4-5.4-.2-.8-.2-1.6.1-2.4z" fill="currentColor" />
    </svg>
  );
}

export function ArrowIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15M14 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PinIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ChatIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16h-6l-4.5 3.8V16H7a2.5 2.5 0 0 1-2.5-2.5z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.5 9.3h7M8.5 12.2h4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 12H5M10 7l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
