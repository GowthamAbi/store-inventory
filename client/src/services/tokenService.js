const TOKEN_KEY = "yarnflow_token";
const USER_KEY = "yarnflow_user";

export const tokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => JSON.parse(localStorage.getItem(USER_KEY) || "null"),

  saveLogin: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearLogin: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
