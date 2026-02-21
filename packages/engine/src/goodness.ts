import { FitResult, FitParams, fourPL } from './fit.js';

/** Goodness-of-fit metrics */
export interface GoodnessOfFit {
  rSquared: number;
  ssRes: number;
  ssTot: number;
  residuals: number[];
  residualPoints: { x: number; residual: number }[];
}

/** Compute goodness-of-fit statistics */
export function computeGoodnessOfFit(
  concentrations: number[],
  responses: number[],
  result: FitResult,
): GoodnessOfFit {
  const n = responses.length;
  const yMean = responses.reduce((a, b) => a + b, 0) / n;
  const ssTot = responses.reduce((s, y) => s + (y - yMean) ** 2, 0);

  const residualPoints = concentrations.map((x, i) => ({
    x,
    residual: result.residuals[i],
  }));

  return {
    rSquared: result.rSquared,
    ssRes: result.ssRes,
    ssTot,
    residuals: result.residuals,
    residualPoints,
  };
}
