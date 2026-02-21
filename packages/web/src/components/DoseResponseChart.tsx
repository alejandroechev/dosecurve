import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ErrorBar,
} from 'recharts';
import type { DataSummary, CurvePoint, FitParams } from '@dosecurve/engine';
import { fourPL } from '@dosecurve/engine';

interface Props {
  summary: DataSummary[];
  curvePoints: CurvePoint[];
  ic50: number;
  params: FitParams;
}

export default function DoseResponseChart({ summary, curvePoints, ic50, params }: Props) {
  const scatterData = summary.map((s) => ({
    x: s.concentration,
    y: s.mean,
    sem: s.sem,
  }));

  const lineData = curvePoints.map((p) => ({
    x: p.x,
    y: p.y,
  }));

  const ic50Y = fourPL(ic50, params);

  const allX = [...scatterData.map((d) => d.x), ...lineData.map((d) => d.x)];
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);

  // Generate log-scale ticks
  const logMin = Math.floor(Math.log10(xMin));
  const logMax = Math.ceil(Math.log10(xMax));
  const ticks: number[] = [];
  for (let i = logMin; i <= logMax; i++) {
    ticks.push(Math.pow(10, i));
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="x"
            type="number"
            scale="log"
            domain={[xMin * 0.5, xMax * 2]}
            ticks={ticks}
            tickFormatter={(v: number) => v.toExponential(0)}
            label={{ value: 'Concentration', position: 'bottom', offset: 20 }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="y"
            label={{ value: 'Response', angle: -90, position: 'insideLeft', offset: -5 }}
          />
          <Tooltip
            formatter={(value: number) => value.toFixed(2)}
            labelFormatter={(label: number) => `Conc: ${label.toExponential(2)}`}
          />

          {/* Fitted curve */}
          <Line
            data={lineData}
            dataKey="y"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            name="4PL Fit"
            isAnimationActive={false}
          />

          {/* Data points */}
          <Scatter
            data={scatterData}
            fill="var(--accent)"
            name="Data"
            isAnimationActive={false}
          >
            <ErrorBar
              dataKey="sem"
              direction="y"
              width={4}
              strokeWidth={1.5}
            />
          </Scatter>

          {/* IC50 reference lines */}
          <ReferenceLine
            x={ic50}
            stroke="var(--error, #dc2626)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: `IC50`, position: 'top', fill: 'var(--error, #dc2626)', fontSize: 12 }}
          />
          <ReferenceLine
            y={ic50Y}
            stroke="var(--error, #dc2626)"
            strokeDasharray="5 5"
            strokeWidth={1}
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
