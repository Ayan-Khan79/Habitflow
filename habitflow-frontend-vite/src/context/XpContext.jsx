import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const XpContext = createContext();

export const XpProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [name, setName] = useState("");

  const loadProfile = async () => {
    try {
      const res = await axiosInstance.get("/auth/profile");
      setXp(res.data.totalXP);
      setName(res.data.name);
    } catch (err) {
      console.log("Failed to load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <XpContext.Provider value={{ xp, setXp, name }}>
      {children}
    </XpContext.Provider>
  );
};

export const useXp = () => useContext(XpContext);
