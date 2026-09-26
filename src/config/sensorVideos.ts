import type { SensorId } from '@/types';

// ================================================================
// USER SENSOR VIDEO CONFIGURATION
// Replace these empty strings with the provided video files.
// Drop your video files into the /public/videos/ folder and
// reference them as "/videos/your-file.mp4".
// ================================================================

export const SENSOR_VIDEO_CONFIG: Record<SensorId, string> = {
  // Aerial survey footage — RGB camera
  rgb: '/videos/aerial-survey.mp4',

  // Thermal infrared footage
  thermal: '/videos/thermal.mp4',

  // USER WILL PROVIDE LiDAR VIDEO HERE
  lidar: '',

  // USER WILL PROVIDE UWB VIDEO HERE
  uwb: '',

  // USER WILL PROVIDE EM/RF VIDEO HERE
  em: '',
};

export const SENSOR_LABELS: Record<SensorId, string> = {
  rgb: 'RGB CAMERA',
  thermal: 'THERMAL CAMERA',
  lidar: '3D LiDAR',
  uwb: 'UWB RADAR',
  em: 'EM / RF',
};

export const SENSOR_DESCRIPTIONS: Record<SensorId, string> = {
  rgb: 'Visible-light aerial survey',
  thermal: 'Infrared heat-signature imaging',
  lidar: '3D laser range reconstruction',
  uwb: 'Ultra-wideband radar detection',
  em: 'Electromagnetic / RF localization',
};
