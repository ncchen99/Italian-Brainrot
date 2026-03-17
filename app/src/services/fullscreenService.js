function getFullscreenElement() {
  return document.fullscreenElement
    || document.webkitFullscreenElement
    || null;
}

export function isFullscreenActive() {
  return Boolean(getFullscreenElement());
}

export async function requestAppFullscreen() {
  if (isFullscreenActive()) return true;

  const root = document.documentElement;

  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen();
      return true;
    }
    if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
