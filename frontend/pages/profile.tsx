// frontend/pages/profile.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  group_id: number;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/me", { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>プロフィール情報</h1>
      <p><strong>名前:</strong> {user.name}</p>
      <p><strong>メール:</strong> {user.email}</p>
      <p><strong>電話番号:</strong> {user.phone}</p>
      <p><strong>権限:</strong> {user.role}</p>
      <p><strong>グループID:</strong> {user.group_id}</p>
    </div>
  );
}
