import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AdminRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("facility_admin");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 認証＋group_id 取得
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then((res) => {
        setGroupId(res.data.group_id);
        setAuthChecked(true);
      })
      .catch(() => router.push("/admin/login"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      alert("group_id が取得できていません");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/admin/register",
        { name, email, phone, password, role, group_id: groupId },
        { withCredentials: true }
      );
      alert("登録完了");
      router.push("/admin");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">管理者登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">氏名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">電話番号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <div>
          <label className="block mb-1">権限ロール</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="facility_admin">施設管理者</option>
            <option value="group_admin">施設グループ管理者</option>
            <option value="viewer">閲覧専用</option>
          </select>
        </div>

        {/* group_id は自動補完、送信のみ */}
        <input type="hidden" value={groupId ?? ""} readOnly />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </form>
    </div>
  );
}
