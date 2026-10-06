export function Pending() {
  return (
    <output className="route-pending wrap" aria-live="polite">
      <span className="micro">OPENING THE NEXT PAGE</span>
      <span className="pending-line" aria-hidden="true" />
    </output>
  );
}
