import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Lambda toolkit
 *
 * @export
 * @interface LambdaConfig
 * @extends {AwsConfig}
 */
export type LambdaConfig = {
  lambdaNameA: string;
  lambdaNameB: string;
  alias?: string;
} & AwsConfig;

/**
 * Map of Lambda metrics with the latest data
 *
 * @export
 * @interface LatestLambdaMetricsMap
 */
export type LatestLambdaMetricsMap = Record<string, LatestLambdaMetric>;

/**
 * Latest metric data for each metric
 *
 * @export
 * @interface LatestLambdaMetric
 */
export type LatestLambdaMetric = {
  latestMetricTimestamp: Date;
  latestMetricValue: number;
  stat?: string;
};
