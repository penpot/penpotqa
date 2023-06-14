const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

export function degreesToRadians(degrees) {
  return degrees * DEG_TO_RAD;
}

export function radiansToDegrees(radians) {
  return radians * RAD_TO_DEG;
}

export default {
  degreesToRadians,
  radiansToDegrees
}
