import { FitParams, FitResult, fourPL } from './fit.js';
import { ConfidenceIntervals } from './confidence.js';
import { GoodnessOfFit } from './goodness.js';
import { DataSummary } from './parser.js';

/** Complete analysis results */
export interface AnalysisResults {
  ic50: number;
  ic50CI: { lower: number; upper: number };
  hillSlope: number;
  hillSlopeCI: { lower: number; upper: number };
  top: number;
  bottom: number;
  rSquared: number;
  converged: boolean;
}

/** Fitted curve point for plotting */
export interface CurvePoint {
  x: number;
  y: number;
}

/** Generate fitted curve data points for plotting */
export function generateCurvePoints(
  params: FitParams,
  xMin: number,
  xMax: number,
  nPoints = 200,
): CurvePoint[] {
  const logMin = Math.log10(xMin);
  const logMax = Math.log10(xMax);
  const step = (logMax - logMin) / (nPoints - 1);

  return Array.from({ length: nPoints }, (_, i) => {
    const x = Math.pow(10, logMin + step * i);
    return { x, y: fourPL(x, params) };
  });
}

/** Export results as CSV string */
export function exportResultsCSV(
  results: AnalysisResults,
  summaryData: DataSummary[],
  curvePoints: CurvePoint[],
): string {
  const lines: string[] = [];

  // Summary section
  lines.push('Parameter,Value,Lower 95% CI,Upper 95% CI');
  lines.push(`IC50,${results.ic50},${results.ic50CI.lower},${results.ic50CI.upper}`);
  lines.push(`Hill Slope,${results.hillSlope},${results.hillSlopeCI.lower},${results.hillSlopeCI.upper}`);
  lines.push(`Top,${results.top},,`);
  lines.push(`Bottom,${results.bottom},,`);
  lines.push(`R²,${results.rSquared},,`);
  lines.push('');

  // Raw data
  lines.push('Concentration,Mean Response,SEM,N');
  for (const d of summaryData) {
    lines.push(`${d.concentration},${d.mean},${d.sem},${d.n}`);
  }
  lines.push('');

  // Fitted curve
  lines.push('Fitted X,Fitted Y');
  for (const pt of curvePoints) {
    lines.push(`${pt.x},${pt.y}`);
  }

  return lines.join('\n');
}

/** Build AnalysisResults from fit + CI */
export function buildResults(
  fit: FitResult,
  ci: ConfidenceIntervals,
): AnalysisResults {
  return {
    ic50: fit.params.ic50,
    ic50CI: { lower: ci.ic50.lower, upper: ci.ic50.upper },
    hillSlope: fit.params.hillSlope,
    hillSlopeCI: { lower: ci.hillSlope.lower, upper: ci.hillSlope.upper },
    top: fit.params.top,
    bottom: fit.params.bottom,
    rSquared: fit.rSquared,
    converged: fit.converged,
  };
}
