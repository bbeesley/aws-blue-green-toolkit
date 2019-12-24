export interface AwsConfig {
  awsProfile: string;
  awsRegion: string;
  environment: string;
  namespace: string;
  tags: Record<string, string>;
}
