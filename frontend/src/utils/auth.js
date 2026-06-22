const AUTH_KEY = "hireRadarAuth";

export const loginUser = (role) => {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ role, authenticated: true, timestamp: Date.now() })
  );
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = () => Boolean(getAuthUser());
