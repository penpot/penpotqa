export function getStorageStatePath() {
  const id = process.env.GITHUB_RUN_ID || 'local';

  return `storageState/owner-${id}.json`;
}
