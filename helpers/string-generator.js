export const random = () => {
  return Math.random().toString(36).substring(2, 7);
};

export function getPlatformName() {
  let platformName;
  let currentOS = process.platform.toLowerCase();

  switch (currentOS) {
    case "win32":
      platformName = "Windows";
      break;
    case "darwin":
      platformName = "MacOS";
      break;
    default:
      platformName = "Linux";
  }
  return platformName;
}
