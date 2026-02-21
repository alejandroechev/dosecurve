import { describe, it, expect } from 'vitest';
import { fit4PL, fourPL, FitParams } from '../fit.js';

// Reference dataset: classic sigmoidal dose-response
// Generated from known 4PL: top=100, bottom=0, IC50=10, hill=1
const knownParams: FitParams = { top: 100, bottom: 0, ic50: 10, hillSlope: 1 };
const concentrations = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000];
const trueResponses = concentrations.map((x) => fourPL(x, knownParams));

describe('fourPL', () => {
  it('computes correct values at known points', () => {
    expect(fourPL(10, knownParams)).toBeCloseTo(50, 5);
    expect(fourPL(0.001, knownParams)).toBeCloseTo(100, 0);
    expect(fourPL(100000, knownParams)).toBeCloseTo(0, 0);
  });

  it('ic50 gives midpoint response', () => {
    const mid = fourPL(knownParams.ic50, knownParams);
    expect(mid).toBeCloseTo((knownParams.top + knownParams.bottom) / 2, 5);
  });
});

describe('fit4PL', () => {
  it('recovers known parameters from noiseless data', () => {
    const result = fit4PL(concentrations, trueResponses);
    expect(result.converged).toBe(true);
    expect(result.params.top).toBeCloseTo(100, 0);
    expect(result.params.bottom).toBeCloseTo(0, 0);
    expect(result.params.ic50).toBeCloseTo(10, 0);
    expect(result.params.hillSlope).toBeCloseTo(1, 1);
    expect(result.rSquared).toBeCloseTo(1, 5);
  });

  it('fits data with steep hill slope', () => {
    const steep: FitParams = { top: 100, bottom: 5, ic50: 50, hillSlope: 2 };
    const y = concentrations.map((x) => fourPL(x, steep));
    const result = fit4PL(concentrations, y);
    expect(result.converged).toBe(true);
    expect(result.params.ic50).toBeCloseTo(50, 0);
    expect(result.rSquared).toBeGreaterThan(0.99);
  });

  it('handles noisy data with R² > 0.9', () => {
    // Add ±5% noise
    const noisy = trueResponses.map((y, i) => y + (i % 2 === 0 ? 3 : -3));
    const result = fit4PL(concentrations, noisy);
    expect(result.rSquared).toBeGreaterThan(0.9);
    expect(result.params.ic50).toBeCloseTo(10, 0);
  });

  it('throws with too few points', () => {
    expect(() => fit4PL([1, 2, 3], [100, 50, 0])).toThrow('at least 4');
  });

  it('throws with mismatched arrays', () => {
    expect(() => fit4PL([1, 2], [100])).toThrow('same length');
  });

  it('produces residuals matching data', () => {
    const result = fit4PL(concentrations, trueResponses);
    for (const r of result.residuals) {
      expect(Math.abs(r)).toBeLessThan(0.01);
    }
  });
});
