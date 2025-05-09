import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth/me", { withCredentials: true });
        setUser(res.data);
      } catch (error) {
        console.error("ユーザー情報取得エラー:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>読み込み中です...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>プロフィール情報</h1>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>名前:</strong> {user?.name}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>メール:</strong> {user?.email}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>電話番号:</strong> {user?.phone}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>権限:</strong> {user?.role}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>グループID:</strong> {user?.group_id}
      </div>
    </div>
  );
}
