import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("facilityadmin");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/groups", {
          withCredentials: true, // 🔴 これを追加
        });
        setGroups(res.data);
      } catch (err) {
        console.error("グループ取得エラー:", err);
        alert("グループの取得に失敗しました");
        router.push("/admin"); // 認証エラー時に管理者TOPへ
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/admin/register",
        { name, email, phone, password, role, group_id: groupId },
        { withCredentials: true }
      );
      alert("登録しました");
      router.push("/admin/admins");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました");
    }
  };

  if (loading) return <p className="p-6">読み込み中...</p>;

  // facilityadmin・viewer は画面アクセス禁止
  if (role === 'facilityadmin' || role === 'viewer') {
    return <p className="p-6 text-red-600">この権限では管理者登録はできません。</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">管理者登録</h1>
      <form onSubmit={handleRegister} className="space-y-4">
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
          <label className="block mb-1">法人名</label>
          <select
            value={groupId ?? ""}
            onChange={(e) => setGroupId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="">選択してください</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">権限</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="facilityadmin">施設管理者</option>
            <option value="groupadmin">施設グループ管理者</option>
            <option value="viewer">閲覧専用</option>
          </select>
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
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          登録する
        </button>
      </form>
    </div>
  );
}
