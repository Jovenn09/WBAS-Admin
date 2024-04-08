import { createContext, useEffect, useState } from "react";
import supabase from "../config/supabaseClient";

export const AuthContext = createContext({
  user: {},
  setUser: () => {},
  isUserLoaded: false,
});

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.log(error.message);
      setUser(data.user);
      setLoading(false);
      console.log(data);
    };
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
