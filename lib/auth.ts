import Cookies from "js-cookie";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export const saveAuth = (token: string, user: User) => {
  Cookies.set("token", token, { expires: 7 });
  Cookies.set("user", JSON.stringify(user), { expires: 7 });
};

export const getUser = (): User | null => {
  try {
    const u = Cookies.get("user");
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const getToken = () => Cookies.get("token") || null;

export const logout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};

export const isLoggedIn = () => !!getToken();