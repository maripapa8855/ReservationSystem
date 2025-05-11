import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const { group_id, facility_id } = router.query;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    
    console.log("📦 router.query:", router.query); // ← これ追加

    if (!group_id || !facility_id) {
      alert("ログインには group_id と facility_id が必要です");
      router.push("/");
      return;
    }

    const fetchFacility = async () => {
      try {
        // ❌ 認証不要なので withCredentials は付けない
        const res = await axios.get(`http://localhost:5000/facilities/${facility_id}`);
        setFacilityName(res.data.name);
      } catch (err) {
        console.error("施設名取得エラー:", err);
        setFacilityName("(施設名取得失敗)");
      }
    };

    fetchFacility();
  }, [router.isReady, group_id, facility_id]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
          group_id,
          facility_id,
        },
        { withCredentials: true }
      );

      const res = await axios.get("http://localhost:5000/auth/check", {
        withCredentials: true,
      });

      setUser({
        userId: res.data.id,
        name: res.data.name,
        email: res.data.email,
        groupId: res.data.group_id,
        facilityId: res.data.facility_id,
        role: res.data.role,
      });

      alert("ログイン成功しました！");
      router.push("/");
    } catch (err: any) {
      console.error("❌ ログインエラー:", err);
      setError(err.response?.data?.message || "ログインに失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">ログイン</h1>
      {facilityName && <p className="mb-4">施設: {facilityName}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">メール</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ログインする
        </button>
      </form>
    </div>
  );
}
