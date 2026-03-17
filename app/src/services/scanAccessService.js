const STORAGE_KEY = 'ibr-scan-access-map';
const ACCESS_TTL_MS = 10 * 60 * 1000;

function readMap() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function grantScanAccess(route, ttlMs = ACCESS_TTL_MS) {
  if (!route) return;
  const map = readMap();
  map[route] = Date.now() + ttlMs;
  writeMap(map);
}

export function hasScanAccess(route) {
  if (!route) return false;
  const map = readMap();
  const expiry = Number(map[route]);
  if (!Number.isFinite(expiry)) return false;
  if (Date.now() > expiry) {
    delete map[route];
    writeMap(map);
    return false;
  }
  return true;
}

export function clearScanAccess() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
