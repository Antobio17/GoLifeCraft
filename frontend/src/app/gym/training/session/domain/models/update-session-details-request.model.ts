export interface UpdateSessionDetailsRequest {
  name: string;
  estimatedDurationMinutes: number;
  restSeconds: number;
  warmupRestSeconds: number;
  progressionEnabled: boolean;
}
