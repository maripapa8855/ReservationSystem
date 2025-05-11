import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface UserContextType {
  userId: number | null;
  name: string | null;
  email: string | null;
  groupId: number | null;
  facilityId: number | null;
  role: string | null;
  loading: boolean;
  setUser: (data: {
    userId: number;
    name: string;
    email: string;
    groupId: number;
    facilityId: number;
    role: string;
  }) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth/check", {
          withCredentials: true,
        });

        console.log("✅ auth/check 結果:", res.data);

        setUser({
          userId: res.data.id,
          name: res.data.name,
          email: res.data.email,
          groupId: res.data.group_id,
          facilityId: res.data.facility_id,
          role: res.data.role,
        });
      } catch (err) {
        console.warn("⚠️ 未認証またはセッション切れ");
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    syncWithServer();
  }, []);

  const setUser = ({
    userId,
    name,
    email,
    groupId,
    facilityId,
    role,
  }: {
    userId: number;
    name: string;
    email: string;
    groupId: number;
    facilityId: number;
    role: string;
  }) => {
    console.log("🟢 setUser 実行:", {
      userId,
      name,
      email,
      groupId,
      facilityId,
      role,
    });

    setUserId(userId);
    setName(name);
    setEmail(email);
    setGroupId(groupId);
    setFacilityId(facilityId);
    setRole(role);

    localStorage.setItem("user_id", String(userId));
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("group_id", String(groupId));
    localStorage.setItem("facility_id", String(facilityId));
    localStorage.setItem("role", role);
  };

  const clearUser = () => {
    setUserId(null);
    setName(null);
    setEmail(null);
    setGroupId(null);
    setFacilityId(null);
    setRole(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{ userId, name, email, groupId, facilityId, role, loading, setUser, clearUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
