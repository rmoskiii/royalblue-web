export function StepHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <>
      <h2 className="font-display text-[30px] leading-tight font-medium tracking-tight text-brand">
        {title}
      </h2>
      <p className="mt-1 mb-4.5 text-sm text-ink-2">{lead}</p>
    </>
  );
}
