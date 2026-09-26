export type StageId =
  | 'init'
  | 'survey'
  | 'reconstruct'
  | 'detect'
  | 'fuse'
  | 'prioritize'
  | 'route'
  | 'report';

export type StageStatus = 'idle' | 'active' | 'complete' | 'failed';

export type MissionStatus = 'standby' | 'active' | 'ready' | 'failed';

export type SensorId = 'rgb' | 'thermal' | 'lidar' | 'uwb' | 'em';

export type PriorityTier = 'high' | 'medium' | 'low';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SensorEvidence {
  thermal: number;
  uwb: number;
  em: number;
  rgb: number;
  geometry: number;
  hazardPenalty: number;
}

export interface Target {
  id: string;
  label: string;
  location: Vec3;
  depth: number;
  confidence: number;
  priorityScore: number;
  priorityTier: PriorityTier;
  urgency: number;
  accessibility: number;
  evidence: SensorEvidence;
  detectionSources: string[];
  status: string;
  description: string;
}

export interface RouteData {
  id: string;
  label: string;
  algorithm: string;
  start: Vec3;
  goal: Vec3;
  waypoints: Vec3[];
  distance: number;
  etaMinutes: number;
  hazardCost: number;
  status: string;
}

export interface Hazard {
  id: string;
  label: string;
  position: Vec3;
  radius: number;
  severity: number;
  type: string;
}

export interface RescueTeam {
  id: string;
  label: string;
  position: Vec3;
  status: string;
  connected: boolean;
  distanceToTarget: number;
}

export interface DroneTelemetry {
  altitude: number;
  flight: string;
  battery: number;
  position: Vec3;
}

export interface SensorFeed {
  id: SensorId;
  label: string;
  description: string;
  status: 'standby' | 'active' | 'playing' | 'paused';
  hasVideo: boolean;
}

export interface PipelineStage {
  id: StageId;
  label: string;
  status: StageStatus;
  progress: number;
}

export interface MissionState {
  missionId: string | null;
  missionStatus: MissionStatus;
  currentStage: StageId;
  stageStatus: StageStatus;
  stageProgress: number;
  sensorFeeds: SensorFeed[];
  targets: Target[];
  selectedTargetId: string | null;
  selectedFeedId: SensorId | null;
  rescueTeam: RescueTeam | null;
  safeRoute: RouteData | null;
  fastRoute: RouteData | null;
  selectedRoute: string | null;
  hazards: Hazard[];
  droneTelemetry: DroneTelemetry;
  pipeline: PipelineStage[];
  createdAt: string | null;
  error: string | null;
  failedStage: StageId | null;
}
