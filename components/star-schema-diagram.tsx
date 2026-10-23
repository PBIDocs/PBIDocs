const FACT = { x: 230, y: 135, w: 100, h: 50, label: 'FactSales', cx: 280, cy: 160 };

const DIMENSIONS = [
  { x: 230, y: 20, w: 100, h: 50, label: 'DimDate', cx: 280, cy: 45 },
  { x: 230, y: 250, w: 100, h: 50, label: 'DimStore', cx: 280, cy: 275 },
  { x: 30, y: 135, w: 120, h: 50, label: 'DimCustomer', cx: 90, cy: 160 },
  { x: 410, y: 135, w: 120, h: 50, label: 'DimProduct', cx: 470, cy: 160 },
];

export function StarSchemaDiagram() {
  return (
    <div id="anatomy-diagram" className="not-prose my-6 flex justify-center rounded-xl border border-fd-border bg-fd-secondary/30 p-5">
      <svg viewBox="0 0 560 320" className="h-auto w-full max-w-lg" role="img" aria-label="Star schema diagram: FactSales in the center, surrounded by DimDate, DimStore, DimCustomer, and DimProduct">
        {DIMENSIONS.map((d) => (
          <line
            key={`line-${d.label}`}
            x1={FACT.cx}
            y1={FACT.cy}
            x2={d.cx}
            y2={d.cy}
            style={{ stroke: 'var(--color-fd-border)' }}
            strokeWidth={2}
          />
        ))}

        {DIMENSIONS.map((d) => (
          <g key={d.label}>
            <rect
              x={d.x}
              y={d.y}
              width={d.w}
              height={d.h}
              rx={8}
              style={{ fill: 'var(--color-fd-background)', stroke: 'var(--color-fd-border)' }}
              strokeWidth={1.5}
            />
            <text
              x={d.x + d.w / 2}
              y={d.y + d.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fill: 'var(--color-fd-muted-foreground)', fontFamily: 'var(--font-mono, monospace)' }}
              fontSize={14}
            >
              {d.label}
            </text>
          </g>
        ))}

        <rect
          x={FACT.x}
          y={FACT.y}
          width={FACT.w}
          height={FACT.h}
          rx={8}
          style={{ fill: 'var(--color-fd-primary)' }}
        />
        <text
          x={FACT.cx}
          y={FACT.cy}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: 'var(--color-fd-primary-foreground)', fontFamily: 'var(--font-mono, monospace)' }}
          fontSize={14}
          fontWeight={600}
        >
          {FACT.label}
        </text>
      </svg>
    </div>
  );
}
