//

export function extractPublicIdFromUrl(url: string): string | null {
  const matches = url.match(
    /\/upload\/[^/]+\/(.+?)\.(jpg|jpeg|png|webp|gif)$/i,
  );
  return matches ? matches[1] : null;
}

export function getCloudinaryPublicId(url: string): string | null {
  try {
    const filename = url.split("/").pop();
    return filename?.split(".").slice(0, -1).join(".") ?? null;
  } catch {
    return null;
  }
}
