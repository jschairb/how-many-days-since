export interface TrendPoint {
  year: number;
  /** Ohio State wins minus Michigan wins for the period. */
  margin: number;
}

export interface Trend {
  slope: number;
  intercept: number;
  start: number;
  end: number;
  direction: 'Michigan' | 'Ohio State' | 'Even';
}

/**
 * Fits a least-squares line to decade margins. Positive values favour Ohio
 * State; negative values favour Michigan.
 */
export function calculateTrend(points: TrendPoint[]): Trend {
  if (points.length === 0) {
    return { slope: 0, intercept: 0, start: 0, end: 0, direction: 'Even' };
  }

  const count = points.length;
  const meanX = points.reduce((sum, point) => sum + point.year, 0) / count;
  const meanY = points.reduce((sum, point) => sum + point.margin, 0) / count;
  const variance = points.reduce((sum, point) => sum + (point.year - meanX) ** 2, 0);
  const covariance = points.reduce(
    (sum, point) => sum + (point.year - meanX) * (point.margin - meanY),
    0
  );
  const slope = variance === 0 ? 0 : covariance / variance;
  const intercept = meanY - slope * meanX;
  const start = intercept + slope * points[0].year;
  const end = intercept + slope * points.at(-1)!.year;

  return {
    slope,
    intercept,
    start,
    end,
    direction: slope > 0 ? 'Ohio State' : slope < 0 ? 'Michigan' : 'Even',
  };
}
