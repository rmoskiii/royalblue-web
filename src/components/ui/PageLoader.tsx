/** Full-screen spinner shown while a code-split page loads on first visit. */
export function PageLoader() {
  return (
    <div className="grid h-dvh place-items-center bg-bg" aria-busy="true" aria-label="Loading">
      <span className="size-8 animate-spin rounded-full border-2 border-surface-3 border-t-primary" />
    </div>
  );
}
