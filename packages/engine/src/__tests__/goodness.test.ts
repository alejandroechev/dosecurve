import { describe, it, expect } from 'vitest';
import { fit4PL, fourPL, FitParams } from '../fit.js';
import { computeGoodnessOfFit } from '../goodness.js';

const knownParams: FitParams = { top: 100, bottom: 0, ic50: 10, hillSlope: 1 };
const concentrations = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000];

describe('computeGoodnessOfFit', () => {
  it('computes correct R² for perfect fit', () => {
    const responses = concentrations.map((x) => fourPL(x, knownParams));
    const result = fit4PL(concentrations, responses);
    const gof = computeGoodnessOfFit(concentrations, responses, result);

    expect(gof.rSquared).toBeCloseTo(1, 5);
    expect(gof.ssRes).toBeCloseTo(0, 5);
    expect(gof.ssTot).toBeGreaterThan(0);
  });

  it('provides residual points for plotting', () => {
    const responses = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 2 : -2),
    );
    const result = fit4PL(concentrations, responses);
    const gof = computeGoodnessOfFit(concentrations, responses, result);

    expect(gof.residualPoints).toHaveLength(concentrations.length);
    expect(gof.residualPoints[0]).toHaveProperty('x');
    expect(gof.residualPoints[0]).toHaveProperty('residual');
  });

  it('R² decreases with more noise', () => {
    const clean = concentrations.map((x) => fourPL(x, knownParams));
    const noisy = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 15 : -15),
    );

    const fitClean = fit4PL(concentrations, clean);
    const fitNoisy = fit4PL(concentrations, noisy);

    const gofClean = computeGoodnessOfFit(concentrations, clean, fitClean);
    const gofNoisy = computeGoodnessOfFit(concentrations, noisy, fitNoisy);

    expect(gofClean.rSquared).toBeGreaterThan(gofNoisy.rSquared);
  });
});
