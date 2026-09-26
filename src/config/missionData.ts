import type { Target, Hazard, RescueTeam, RouteData, Vec3 } from '@/types';

// ================================================================
// DETERMINISTIC MISSION DATA
// Every mission run produces the same story.
// ================================================================

export const RESCUE_TEAM_LOCATION: Vec3 = { x: -8, y: 0, z: 6 };

export const DRONE_LOCATION: Vec3 = { x: 0, y: 12, z: 0 };

export const TARGETS: Target[] = [
  {
    id: 'T01',
    label: 'TARGET 01',
    location: { x: 4.5, y: -1.2, z: -3 },
    depth: 1.2,
    confidence: 0.94,
    priorityScore: 0.85,
    priorityTier: 'high',
    urgency: 0.88,
    accessibility: 0.63,
    evidence: {
      thermal: 0.05,
      uwb: 0.03,
      em: 0.94,
      rgb: 0.0,
      geometry: 0.72,
      hazardPenalty: 0.05,
    },
    detectionSources: ['em'],
    status: 'rf_source_localized',
    description: 'RF source localized — probable mobile-phone source',
  },
  {
    id: 'T02',
    label: 'TARGET 02',
    location: { x: -3, y: -0.8, z: -5 },
    depth: 0.8,
    confidence: 0.76,
    priorityScore: 0.71,
    priorityTier: 'medium',
    urgency: 0.72,
    accessibility: 0.68,
    evidence: {
      thermal: 0.76,
      uwb: 0.82,
      em: 0.1,
      rgb: 0.15,
      geometry: 0.65,
      hazardPenalty: 0.08,
    },
    detectionSources: ['thermal', 'uwb'],
    status: 'thermal_uwb_correlation',
    description: 'Thermal + UWB correlation — heat signature with motion response',
  },
  {
    id: 'T03',
    label: 'TARGET 03',
    location: { x: 2, y: -1.5, z: 4 },
    depth: 1.5,
    confidence: 0.72,
    priorityScore: 0.68,
    priorityTier: 'medium',
    urgency: 0.65,
    accessibility: 0.7,
    evidence: {
      thermal: 0.72,
      uwb: 0.68,
      em: 0.05,
      rgb: 0.1,
      geometry: 0.6,
      hazardPenalty: 0.06,
    },
    detectionSources: ['thermal', 'uwb'],
    status: 'thermal_uwb_correlation',
    description: 'Thermal + UWB correlation — secondary heat cluster',
  },
  {
    id: 'T04',
    label: 'TARGET 04',
    location: { x: -5, y: -0.5, z: 2 },
    depth: 0.5,
    confidence: 0.34,
    priorityScore: 0.42,
    priorityTier: 'low',
    urgency: 0.4,
    accessibility: 0.45,
    evidence: {
      thermal: 0.3,
      uwb: 0.25,
      em: 0.08,
      rgb: 0.12,
      geometry: 0.35,
      hazardPenalty: 0.04,
    },
    detectionSources: ['ambiguous'],
    status: 'low_confidence_anomaly',
    description: 'Ambiguous weak sensor indication — requires further analysis',
  },
];

export const HAZARDS: Hazard[] = [
  {
    id: 'H01',
    label: 'Structural Collapse Zone',
    position: { x: 0, y: 0, z: -1 },
    radius: 2.5,
    severity: 0.8,
    type: 'collapse',
  },
  {
    id: 'H02',
    label: 'Gas Leak Area',
    position: { x: -1, y: 0, z: 3 },
    radius: 2,
    severity: 0.65,
    type: 'gas',
  },
  {
    id: 'H03',
    label: 'Unstable Rubble',
    position: { x: 3, y: 0, z: 1 },
    radius: 1.8,
    severity: 0.5,
    type: 'rubble',
  },
];

export const RESCUE_TEAM: RescueTeam = {
  id: 'TEAM01',
  label: 'TEAM 01',
  position: RESCUE_TEAM_LOCATION,
  status: 'READY',
  connected: true,
  distanceToTarget: 0,
};

// Confidence weights for the visible formula
export const CONFIDENCE_WEIGHTS = {
  thermal: 0.25,
  uwb: 0.25,
  em: 0.2,
  rgb: 0.15,
  geometry: 0.15,
};

export const HAZARD_WEIGHT = 0.1;

// Priority weights
export const PRIORITY_WEIGHTS = {
  urgency: 0.5,
  accessibility: 0.2,
  confidence: 0.3,
};

// Generate safe route waypoints (Informed RRT* — safest, avoids hazards)
export const SAFE_ROUTE: RouteData = {
  id: 'safe',
  label: 'Safest Route',
  algorithm: 'Informed RRT*',
  start: RESCUE_TEAM_LOCATION,
  goal: TARGETS[0].location,
  waypoints: [
    { x: -8, y: 0, z: 6 },
    { x: -9, y: 0, z: 3 },
    { x: -7, y: 0, z: 0 },
    { x: -4, y: 0, z: -2 },
    { x: -1, y: 0, z: -4 },
    { x: 2, y: 0, z: -4 },
    { x: 4.5, y: 0, z: -3 },
  ],
  distance: 18.6,
  etaMinutes: 12,
  hazardCost: 0.05,
  status: 'ready',
};

// Generate fast route waypoints (Informed RRT* — shorter, accepts some risk)
export const FAST_ROUTE: RouteData = {
  id: 'fast',
  label: 'Fastest Feasible Route',
  algorithm: 'Informed RRT*',
  start: RESCUE_TEAM_LOCATION,
  goal: TARGETS[0].location,
  waypoints: [
    { x: -8, y: 0, z: 6 },
    { x: -5, y: 0, z: 4 },
    { x: -2, y: 0, z: 2 },
    { x: 1, y: 0, z: 0 },
    { x: 3, y: 0, z: -1.5 },
    { x: 4.5, y: 0, z: -3 },
  ],
  distance: 14.2,
  etaMinutes: 8,
  hazardCost: 0.22,
  status: 'ready',
};

export const STAGE_DURATIONS: Record<string, number> = {
  survey: 10000,
  reconstruct: 5000,
  detect: 12000,
  fuse: 3000,
  prioritize: 5000,
  route: 6000,
};

export const STAGE_LABELS: Record<string, string> = {
  init: 'INIT',
  survey: 'SURVEY',
  reconstruct: '3D MAP',
  detect: 'DETECT',
  fuse: 'FUSE',
  prioritize: 'PRIORITIZE',
  route: 'PLAN ROUTE',
  report: 'REPORT',
};

export function generateMissionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let id = 'MSN-';
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
