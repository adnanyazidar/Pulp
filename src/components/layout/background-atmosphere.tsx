export function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pf-primary/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-pf-tertiary/10 blur-[120px] animate-pulse-slow" />
    </div>
  );
}
