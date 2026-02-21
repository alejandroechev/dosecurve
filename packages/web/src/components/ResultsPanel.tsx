import type { AnalysisResults, GoodnessOfFit } from '@dosecurve/engine';

interface Props {
  results: AnalysisResults;
  gof: GoodnessOfFit | null;
}

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < 0.01 || Math.abs(n) >= 10000) return n.toExponential(digits);
  return n.toFixed(digits);
}

export default function ResultsPanel({ results, gof }: Props) {
  return (
    <div className="panel">
      <h2>Results</h2>
      <div className="results-grid">
        <div className="result-item">
          <span className="result-label">IC50</span>
          <span className="result-value">{fmt(results.ic50)}</span>
          <span className="result-ci">
            [{fmt(results.ic50CI.lower)} – {fmt(results.ic50CI.upper)}]
          </span>
        </div>

        <div className="result-item">
          <span className="result-label">Hill Slope</span>
          <span className="result-value">{fmt(results.hillSlope)}</span>
          <span className="result-ci">
            [{fmt(results.hillSlopeCI.lower)} – {fmt(results.hillSlopeCI.upper)}]
          </span>
        </div>

        <div className="result-item">
          <span className="result-label">Top</span>
          <span className="result-value">{fmt(results.top)}</span>
        </div>

        <div className="result-item">
          <span className="result-label">Bottom</span>
          <span className="result-value">{fmt(results.bottom)}</span>
        </div>

        <div className="result-item">
          <span className="result-label">R²</span>
          <span className="result-value">{fmt(results.rSquared, 6)}</span>
        </div>

        <div className="result-item">
          <span className="result-label">Converged</span>
          <span className="result-value">{results.converged ? '✓ Yes' : '✗ No'}</span>
        </div>
      </div>

      {gof && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--fg2)' }}>
          SS<sub>res</sub> = {fmt(gof.ssRes)} · SS<sub>tot</sub> = {fmt(gof.ssTot)}
        </div>
      )}
    </div>
  );
}
