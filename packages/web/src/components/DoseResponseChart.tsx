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
import { useEffect, useState } from 'react';

interface Props {
  summary: DataSummary[];
  curvePoints: CurvePoint[];
  ic50: number;
  params: FitParams;
}

/** Read resolved CSS custom property values for Recharts (SVG attrs can't use var()). */
function useChartColors() {
  const [colors, setColors] = useState({ fg2: '#666', border: '#ccc' });
  useEffect(() => {
    const update = () => {
      const s = getComputedStyle(document.documentElement);
      setColors({
        fg2: s.getPropertyValue('--fg2').trim() || '#666',
        border: s.getPropertyValue('--border').trim() || '#ccc',
      });
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return colors;
}

export default function DoseResponseChart({ summary, curvePoints, ic50, params }: Props) {
  const chartColors = useChartColors();
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
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} opacity={0.3} />
          <XAxis
            dataKey="x"
            type="number"
            scale="log"
            domain={[xMin * 0.5, xMax * 2]}
            ticks={ticks}
            tickFormatter={(v: number) => v.toExponential(0)}
            tick={{ fill: chartColors.fg2 }}
            label={{ value: 'Concentration', position: 'bottom', offset: 20, fill: chartColors.fg2 }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="y"
            tick={{ fill: chartColors.fg2 }}
            label={{ value: 'Response', angle: -90, position: 'insideLeft', offset: -5, fill: chartColors.fg2 }}
          />
          <Tooltip
            formatter={(value: number) => value.toFixed(2)}
            labelFormatter={(label: number) => `Conc: ${label.toExponential(2)}`}
            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            labelStyle={{ color: 'var(--fg)' }}
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
