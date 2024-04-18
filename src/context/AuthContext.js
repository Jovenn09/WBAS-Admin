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

      if (data.user?.user_metadata?.access === "student") {
        let { data: students } = await supabase
          .from("students")
          .select("student_id")
          .eq("uuid", data.user.id);
        setUser({ student_id: students[0].student_id, ...data.user });
      } else {
        setUser(data.user);
      }

      setLoading(false);
    };
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
