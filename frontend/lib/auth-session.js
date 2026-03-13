const TOKEN_STORAGE_KEYS = ["rastreador_token", "authToken", "token"];
const USER_STORAGE_KEYS = ["rastreador_user", "authUser", "user"];
const OPTIONS_STORAGE_KEYS = ["rastreador_options", "authOptions"];

const DEFAULT_OPTIONS = {
  trackingConsent: false,
  backgroundLocation: false,
  batteryExemption: false,
};

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function decodeBase64Url(base64UrlValue) {
  if (!base64UrlValue) return null;
  try {
    const normalized = base64UrlValue.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    if (typeof atob !== "function") return null;
    return atob(padded);
  } catch {
    return null;
  }
}

function safeParseJson(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  const payloadSection = token?.split(".")?.[1];
  const decodedPayload = decodeBase64Url(payloadSection);
  return safeParseJson(decodedPayload);
}

export function getAuthToken() {
  const storage = getStorage();
  if (!storage) return null;
  for (const key of TOKEN_STORAGE_KEYS) {
    const candidate = storage.getItem(key);
    if (candidate) return candidate;
  }
  return null;
}

export function getAuthUser() {
  const storage = getStorage();
  if (!storage) return null;
  for (const key of USER_STORAGE_KEYS) {
    const parsedUser = safeParseJson(storage.getItem(key));
    if (parsedUser && typeof parsedUser === "object") return parsedUser;
  }
  return null;
}

export function getAuthOptions() {
  const storage = getStorage();
  if (!storage) return DEFAULT_OPTIONS;
  for (const key of OPTIONS_STORAGE_KEYS) {
    const saved = safeParseJson(storage.getItem(key));
    if (saved && typeof saved === "object") return { ...DEFAULT_OPTIONS, ...saved };
  }
  return DEFAULT_OPTIONS;
}

export function setAuthSession(token, user = null, options = null) {
  const storage = getStorage();
  if (!storage || !token) return;

  TOKEN_STORAGE_KEYS.forEach((key) => storage.setItem(key, token));

  if (user && typeof user === "object") {
    storage.setItem(USER_STORAGE_KEYS[0], JSON.stringify(user));
  }

  if (options && typeof options === "object") {
    storage.setItem(OPTIONS_STORAGE_KEYS[0], JSON.stringify(options));
  }
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) return;
  [...TOKEN_STORAGE_KEYS, ...USER_STORAGE_KEYS, ...OPTIONS_STORAGE_KEYS].forEach((key) =>
    storage.removeItem(key)
  );
}

export function getAuthContext() {
  const token = getAuthToken();
  const storedUser = getAuthUser();
  const options = getAuthOptions();
  const jwtPayload = decodeJwtPayload(token);

  const userId = storedUser?.id || storedUser?.id_user || jwtPayload?.id || null;
  const role = storedUser?.rol || storedUser?.role || jwtPayload?.rol || null;

  return {
    token,
    userId,
    role,
    user: storedUser || null,
    jwtPayload,
    options,
  };
}
