/** The drawn arrow: a chevron at rest, its stem grows on hover (globals.css .m-arrow). */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={`m-arrow ${className ?? ""}`} viewBox="0 0 12 12" aria-hidden="true">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  );
}
