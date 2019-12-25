/**
 * Base config used in all tool kits
 * @export
 * @interface AwsConfig
 */
export interface AwsConfig {
  awsProfile: string;
  awsRegion: string;
  environment: string;
  namespace: string;
  tags: Record<string, string>;
}
