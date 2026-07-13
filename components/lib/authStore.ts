let _userToken: string | null = null;
let _superAdminToken: string | null = null;

export const authStore = {
  // ─── User ───────────────────────────────
  setToken(token: string) { _userToken = token; },
  getToken() { return _userToken; },
  clear() { _userToken = null; },

  // ─── Super Admin ────────────────────────
  setSuperAdminToken(token: string) { _superAdminToken = token; },
  getSuperAdminToken() { return _superAdminToken; },
  clearSuperAdmin() { _superAdminToken = null; },
};