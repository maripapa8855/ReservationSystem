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
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [groupsRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/groups"),
          axios.get("http://localhost:5000/admin/check", { withCredentials: true }),
        ]);
        setGroups(groupsRes.data);
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error("初期データ取得エラー:", err);
        alert("初期データの取得に失敗しました");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/admin/register",
        { name, email, phone, password, role, group_id: groupId, facility_id: facilityId },
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
  if (currentUser.role === 'facilityadmin' || currentUser.role === 'viewer') {
    return <p className="p-6 text-red-600">この権限では管理者登録はできません。</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">管理者登録</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1">氏名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2 rounded w-full" required />
        </div>
        <div>
          <label className="block mb-1">メール</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-3 py-2 rounded w-full" required />
        </div>
        <div>
          <label className="block mb-1">電話番号</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="border px-3 py-2 rounded w-full" required />
        </div>
        <div>
          <label className="block mb-1">法人名</label>
          <select value={groupId ?? ""} onChange={(e) => setGroupId(Number(e.target.value))} className="border px-3 py-2 rounded w-full" required>
            <option value="">選択してください</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">施設ID（任意）</label>
          <input type="number" value={facilityId ?? ""} onChange={(e) => setFacilityId(Number(e.target.value))} className="border px-3 py-2 rounded w-full" />
        </div>
        <div>
          <label className="block mb-1">権限</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-3 py-2 rounded w-full">
            {currentUser.role === 'superadmin' && <option value="superadmin">統括管理者</option>}
            {currentUser.role === 'superadmin' && <option value="groupadmin">法人管理者</option>}
            <option value="facilityadmin">施設管理者</option>
            <option value="viewer">閲覧専用</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border px-3 py-2 rounded w-full" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">登録する</button>
      </form>
    </div>
  );
}
