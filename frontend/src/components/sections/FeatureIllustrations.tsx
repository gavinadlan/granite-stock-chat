// Structure of each answer card without any values: labels are real, figures are blank blocks.

const Block = ({ className }: { className: string }) => <span className={`block rounded-sm bg-muted ${className}`} />;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div aria-hidden="true" className="w-full max-w-xl space-y-4 rounded-card border bg-card p-4 sm:p-5">
    {children}
  </div>
);

const Row = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between gap-4 text-muted-foreground">
    {label}
    <Block className="h-4 w-20" />
  </div>
);

const Source = () => (
  <div className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
    Source <Block className="h-3.5 w-24" /> <Block className="h-3.5 w-28" />
  </div>
);

export function PriceIllustration() {
  return (
    <Frame>
      <Block className="h-5 w-24" />
      <Block className="h-10 w-44" />
      <div className="space-y-1.5 border-t pt-3">
        <Row label="Volume" />
        <Row label="Market cap" />
      </div>
      <Source />
    </Frame>
  );
}

export function TechnicalIllustration() {
  return (
    <Frame>
      <div className="space-y-2">
        <Row label="RSI" />
        <div className="flex h-2 gap-0.5">
          <span className="w-[30%] rounded-l-sm bg-input/40" />
          <span className="w-[40%] bg-muted" />
          <span className="flex-1 rounded-r-sm bg-input/40" />
        </div>
      </div>
      <div className="space-y-1.5 border-t pt-3">
        <Row label="MACD" />
        <Row label="Moving averages" />
        <Row label="Support and resistance" />
      </div>
      <Source />
    </Frame>
  );
}

export function NewsIllustration() {
  return (
    <Frame>
      {['w-11/12', 'w-4/5', 'w-5/6'].map((width) => (
        <div key={width} className="space-y-2 border-b pb-4">
          <Block className={`h-4 ${width}`} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Publisher <Block className="h-3.5 w-20" />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Source <Block className="h-3.5 w-24" /> <Block className="h-3.5 w-28" />
      </div>
    </Frame>
  );
}
