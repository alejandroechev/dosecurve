import { describe, it, expect } from 'vitest';
import { parseData, summarize } from '../parser.js';

describe('parseData', () => {
  it('parses tab-separated two-column data', () => {
    const input = `1\t100
10\t80
100\t50
1000\t20`;
    const result = parseData(input);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ concentration: 1, responses: [100] });
    expect(result[3]).toEqual({ concentration: 1000, responses: [20] });
  });

  it('parses comma-separated data', () => {
    const input = `1,100
10,80
100,50
1000,20`;
    const result = parseData(input);
    expect(result).toHaveLength(4);
    expect(result[0].concentration).toBe(1);
  });

  it('groups replicates by concentration', () => {
    const input = `1\t100
1\t95
10\t80
10\t75`;
    const result = parseData(input);
    expect(result).toHaveLength(2);
    expect(result[0].responses).toEqual([100, 95]);
    expect(result[1].responses).toEqual([80, 75]);
  });

  it('handles multi-column replicates', () => {
    const input = `1\t100\t95\t98
10\t80\t75\t78`;
    const result = parseData(input);
    expect(result).toHaveLength(2);
    expect(result[0].responses).toEqual([100, 95, 98]);
  });

  it('skips header row', () => {
    const input = `Concentration\tResponse
1\t100
10\t80`;
    const result = parseData(input);
    expect(result).toHaveLength(2);
  });

  it('throws on empty input', () => {
    expect(() => parseData('')).toThrow('No data provided');
  });

  it('throws on invalid data', () => {
    expect(() => parseData('abc\txyz')).toThrow('No valid data points found');
  });

  it('ignores zero/negative concentrations', () => {
    const input = `0\t100
-1\t90
1\t80`;
    const result = parseData(input);
    expect(result).toHaveLength(1);
    expect(result[0].concentration).toBe(1);
  });
});

describe('summarize', () => {
  it('computes mean and SEM', () => {
    const points = [
      { concentration: 1, responses: [100, 90, 110] },
      { concentration: 10, responses: [50] },
    ];
    const summary = summarize(points);
    expect(summary).toHaveLength(2);
    expect(summary[0].mean).toBe(100);
    expect(summary[0].n).toBe(3);
    expect(summary[0].sem).toBeCloseTo(10 / Math.sqrt(3), 5);
    expect(summary[1].sem).toBe(0);
  });
});
