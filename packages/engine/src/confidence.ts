import { FitParams, computeJacobian } from './fit.js';

/** Confidence interval for a parameter */
export interface ParamCI {
  value: number;
  lower: number;
  upper: number;
}

/** All parameter CIs */
export interface ConfidenceIntervals {
  top: ParamCI;
  bottom: ParamCI;
  ic50: ParamCI;
  hillSlope: ParamCI;
}

/** Invert a 4x4 matrix using cofactors */
function invert4x4(m: number[][]): number[][] | null {
  const n = 4;
  const aug = m.map((row, i) => {
    const r = new Array(2 * n).fill(0);
    for (let j = 0; j < n; j++) r[j] = row[j];
    r[n + i] = 1;
    return r;
  });

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-15) return null;

    const pivot = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  return aug.map((row) => row.slice(n));
}

/**
 * Compute 95% confidence intervals for 4PL parameters
 * using Jacobian-based covariance matrix estimation.
 *
 * Covariance = s² * (JᵀJ)⁻¹ where s² = SSres / (n - p)
 */
export function computeCI(
  concentrations: number[],
  params: FitParams,
  ssRes: number,
  alpha = 0.05,
): ConfidenceIntervals {
  const n = concentrations.length;
  const p = 4; // number of parameters
  const dof = n - p;

  if (dof <= 0) {
    // Not enough data for CI — return ±Infinity
    const noCI = (v: number): ParamCI => ({
      value: v,
      lower: -Infinity,
      upper: Infinity,
    });
    return {
      top: noCI(params.top),
      bottom: noCI(params.bottom),
      ic50: noCI(params.ic50),
      hillSlope: noCI(params.hillSlope),
    };
  }

  const J = computeJacobian(concentrations, params);

  // JᵀJ
  const JtJ = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      for (let b = 0; b < p; b++) {
        JtJ[a][b] += J[i][a] * J[i][b];
      }
    }
  }

  const JtJinv = invert4x4(JtJ);
  if (!JtJinv) {
    const noCI = (v: number): ParamCI => ({
      value: v,
      lower: -Infinity,
      upper: Infinity,
    });
    return {
      top: noCI(params.top),
      bottom: noCI(params.bottom),
      ic50: noCI(params.ic50),
      hillSlope: noCI(params.hillSlope),
    };
  }

  const s2 = ssRes / dof;

  // Approximate t-critical for 95% CI using normal approximation for dof > 30,
  // otherwise a lookup table for common values
  const tCrit = tCriticalApprox(dof, alpha);

  const paramArr = [params.top, params.bottom, params.ic50, params.hillSlope];
  const keys: (keyof FitParams)[] = ['top', 'bottom', 'ic50', 'hillSlope'];
  const result: Record<string, ParamCI> = {};

  for (let i = 0; i < p; i++) {
    const se = Math.sqrt(Math.max(0, s2 * JtJinv[i][i]));
    const margin = tCrit * se;
    result[keys[i]] = {
      value: paramArr[i],
      lower: paramArr[i] - margin,
      upper: paramArr[i] + margin,
    };
  }

  return result as unknown as ConfidenceIntervals;
}

/** Approximate t-critical value for two-tailed test */
function tCriticalApprox(dof: number, alpha: number): number {
  // Common t-values for 95% CI (alpha=0.05, two-tailed)
  const table: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    60: 2.000, 120: 1.980,
  };

  if (alpha !== 0.05) return 1.96; // fallback for non-standard alpha

  if (table[dof] !== undefined) return table[dof];

  // Interpolate or use normal approximation
  if (dof > 120) return 1.96;

  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (dof >= keys[i] && dof <= keys[i + 1]) {
      const frac = (dof - keys[i]) / (keys[i + 1] - keys[i]);
      return table[keys[i]] * (1 - frac) + table[keys[i + 1]] * frac;
    }
  }

  return 1.96;
}
