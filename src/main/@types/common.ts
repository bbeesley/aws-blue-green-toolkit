/**
 * Base config used in all tool kits
 *
 * @export
 * @interface AwsConfig
 */
export type AwsConfig = {
  awsProfile: string;
  awsRegion: string;
  environment: string;
  tags: Record<string, string>;
};
