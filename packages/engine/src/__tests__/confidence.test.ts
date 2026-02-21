import { describe, it, expect } from 'vitest';
import { fit4PL, fourPL, FitParams } from '../fit.js';
import { computeCI } from '../confidence.js';

const knownParams: FitParams = { top: 100, bottom: 0, ic50: 10, hillSlope: 1 };
const concentrations = [0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000];

describe('computeCI', () => {
  it('produces finite CIs for well-determined fit', () => {
    // Add slight noise so ssRes > 0
    const responses = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 1 : -1),
    );
    const result = fit4PL(concentrations, responses);
    const ci = computeCI(concentrations, result.params, result.ssRes);

    expect(ci.ic50.lower).toBeLessThan(ci.ic50.value);
    expect(ci.ic50.upper).toBeGreaterThan(ci.ic50.value);
    expect(Number.isFinite(ci.ic50.lower)).toBe(true);
    expect(Number.isFinite(ci.ic50.upper)).toBe(true);

    // IC50 CI should bracket the true value (approximately)
    expect(ci.ic50.lower).toBeLessThan(15);
    expect(ci.ic50.upper).toBeGreaterThan(5);
  });

  it('CI widens with more noise', () => {
    const lowNoise = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 0.5 : -0.5),
    );
    const highNoise = concentrations.map(
      (x, i) => fourPL(x, knownParams) + (i % 2 === 0 ? 5 : -5),
    );

    const fitLow = fit4PL(concentrations, lowNoise);
    const fitHigh = fit4PL(concentrations, highNoise);

    const ciLow = computeCI(concentrations, fitLow.params, fitLow.ssRes);
    const ciHigh = computeCI(concentrations, fitHigh.params, fitHigh.ssRes);

    const widthLow = ciLow.ic50.upper - ciLow.ic50.lower;
    const widthHigh = ciHigh.ic50.upper - ciHigh.ic50.lower;

    expect(widthHigh).toBeGreaterThan(widthLow);
  });

  it('returns ±Infinity when not enough data for CI', () => {
    const conc = [1, 10, 100, 1000];
    const resp = conc.map((x) => fourPL(x, knownParams));
    const result = fit4PL(conc, resp);
    const ci = computeCI(conc, result.params, result.ssRes);
    // dof = 4 - 4 = 0
    expect(ci.ic50.lower).toBe(-Infinity);
  });
});
