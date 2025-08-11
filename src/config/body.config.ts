export function getJsonBodyLimit(): number {
  const mb: number = Number(process.env.JSON_BODY_LIMIT || '1mb');
  return Math.max(1, mb) * 1024 * 1024;
}