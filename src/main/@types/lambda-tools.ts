import type { AwsConfig } from './common.js';

/**
 * Configuration options for the Lambda toolkit
 *
 * @export
 * @interface LambdaConfig
 * @extends {AwsConfig}
 */
export interface LambdaConfig extends AwsConfig {
  lambdaNameA: string;
  lambdaNameB: string;
  alias?: string;
}

/**
 * Map of Lambda metrics with the latest data
 *
 * @export
 * @interface LatestLambdaMetricsMap
 */
export interface LatestLambdaMetricsMap {
  [metricName: string]: LatestLambdaMetric;
}

/**
 * Latest metric data for each metric
 *
 * @export
 * @interface LatestLambdaMetric
 */
export interface LatestLambdaMetric {
  latestMetricTimestamp: Date;
  latestMetricValue: number;
  stat?: string;
}
