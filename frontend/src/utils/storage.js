const TOKEN_KEY = "team-task-manager-token";

export const getStoredToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};
