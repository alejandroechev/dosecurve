/** 4-Parameter Logistic model parameters */
export interface FitParams {
  top: number;
  bottom: number;
  ic50: number;
  hillSlope: number;
}

/** Result of a 4PL fit */
export interface FitResult {
  params: FitParams;
  residuals: number[];
  ssRes: number;
  rSquared: number;
  iterations: number;
  converged: boolean;
}

/** 4PL model: y = bottom + (top - bottom) / (1 + (x/ic50)^hillSlope) */
export function fourPL(x: number, p: FitParams): number {
  return p.bottom + (p.top - p.bottom) / (1 + Math.pow(x / p.ic50, p.hillSlope));
}

/** Initial parameter estimates from data */
function initialGuess(x: number[], y: number[]): FitParams {
  const sortedY = [...y].sort((a, b) => a - b);
  const top = sortedY[sortedY.length - 1];
  const bottom = sortedY[0];
  const mid = (top + bottom) / 2;

  // Find x closest to midpoint response
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < y.length; i++) {
    const d = Math.abs(y[i] - mid);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  const ic50 = x[bestIdx];

  // Determine hill slope sign: if response decreases with concentration, positive
  const hillSlope = y[0] > y[y.length - 1] ? 1 : -1;

  return { top, bottom, ic50, hillSlope };
}

/** Compute Jacobian row for one data point */
function jacobianRow(x: number, p: FitParams): number[] {
  const ratio = x / p.ic50;
  const powered = Math.pow(ratio, p.hillSlope);
  const denom = 1 + powered;
  const denom2 = denom * denom;
  const range = p.top - p.bottom;

  // dy/dBottom = 1 - 1/(1+powered) = powered/denom
  const dBottom = powered / denom;
  // dy/dTop = 1/denom
  const dTop = 1 / denom;
  // dy/dIC50 = range * hillSlope * powered / (ic50 * denom^2)
  const dIC50 = range * p.hillSlope * powered / (p.ic50 * denom2);
  // dy/dHillSlope = -range * powered * ln(ratio) / denom^2
  const logRatio = ratio > 0 ? Math.log(ratio) : 0;
  const dHill = -range * powered * logRatio / denom2;

  return [dTop, dBottom, dIC50, dHill];
}

/** Solve Ax = b for small systems using Gaussian elimination */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-15) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j];
    if (Math.abs(aug[i][i]) > 1e-15) x[i] /= aug[i][i];
  }
  return x;
}

/**
 * Levenberg-Marquardt nonlinear least-squares fitting of 4PL model.
 */
export function fit4PL(
  concentrations: number[],
  responses: number[],
  maxIter = 200,
  tol = 1e-8,
): FitResult {
  if (concentrations.length !== responses.length) {
    throw new Error('Concentration and response arrays must have same length');
  }
  if (concentrations.length < 4) {
    throw new Error('Need at least 4 data points for 4PL fit');
  }

  const n = concentrations.length;
  let p = initialGuess(concentrations, responses);
  let lambda = 0.01;

  const toArray = (p: FitParams) => [p.top, p.bottom, p.ic50, p.hillSlope];
  const fromArray = (a: number[]): FitParams => ({
    top: a[0],
    bottom: a[1],
    ic50: Math.max(a[2], 1e-20),
    hillSlope: a[3],
  });

  const computeResiduals = (p: FitParams) =>
    responses.map((y, i) => y - fourPL(concentrations[i], p));

  const sumSq = (r: number[]) => r.reduce((s, v) => s + v * v, 0);

  let residuals = computeResiduals(p);
  let ssRes = sumSq(residuals);
  let converged = false;
  let iter = 0;

  for (iter = 0; iter < maxIter; iter++) {
    // Build Jacobian
    const J: number[][] = [];
    for (let i = 0; i < n; i++) {
      J.push(jacobianRow(concentrations[i], p));
    }

    // JᵀJ and Jᵀr
    const JtJ = Array.from({ length: 4 }, () => new Array(4).fill(0));
    const Jtr = new Array(4).fill(0);

    for (let i = 0; i < n; i++) {
      for (let a = 0; a < 4; a++) {
        Jtr[a] += J[i][a] * residuals[i];
        for (let b = 0; b < 4; b++) {
          JtJ[a][b] += J[i][a] * J[i][b];
        }
      }
    }

    // Damped normal equations: (JᵀJ + λI)Δp = Jᵀr
    const damped = JtJ.map((row, i) =>
      row.map((v, j) => (i === j ? v + lambda * (v + 1e-10) : v)),
    );

    const delta = solve(damped, Jtr);

    const pArr = toArray(p);
    const newArr = pArr.map((v, i) => v + delta[i]);
    const pNew = fromArray(newArr);

    const newResiduals = computeResiduals(pNew);
    const newSsRes = sumSq(newResiduals);

    if (newSsRes < ssRes) {
      p = pNew;
      residuals = newResiduals;
      const improvement = (ssRes - newSsRes) / (ssRes + 1e-15);
      ssRes = newSsRes;
      lambda *= 0.5;
      if (improvement < tol) {
        converged = true;
        break;
      }
    } else {
      lambda *= 5;
    }
  }

  // R²
  const yMean = responses.reduce((a, b) => a + b, 0) / n;
  const ssTot = responses.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  return { params: p, residuals, ssRes, rSquared, iterations: iter, converged };
}

/** Compute Jacobian matrix for confidence interval estimation */
export function computeJacobian(concentrations: number[], p: FitParams): number[][] {
  return concentrations.map((x) => jacobianRow(x, p));
}
