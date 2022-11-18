/**
 * Enum for describing the state of an RDS cluster
 *
 * @export
 * @enum {number}
 */
export enum ClusterState {
  STARTING = 'starting',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  AVAILABLE = 'available',
}

/**
 * Enum for referencing blue or green stacks
 *
 * @export
 * @enum {number}
 */
export enum StackReference {
  a = 'a',
  b = 'b',
}

export enum Operation {
  ENABLE,
  DISABLE,
}
