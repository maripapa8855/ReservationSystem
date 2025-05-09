import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminEditPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("facility_admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/admin/admins/${id}`, {
          withCredentials: true,
        });
        const admin = res.data;
        setName(admin.name);
        setEmail(admin.email);
        setPhone(admin.phone);
        setRole(admin.role);
      } catch (err) {
        console.error("管理者取得エラー:", err);
        alert("管理者の情報取得に失敗しました");
        router.push("/admin/admins");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmin();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/admin/admins/${id}`,
        { name, email, phone, role },
        { withCredentials: true }
      );
      alert("更新しました");
      router.push("/admin/admins");
    } catch (err) {
      console.error("更新エラー:", err);
      alert("更新に失敗しました");
    }
  };

  if (loading) return <p className="p-6">読み込み中...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">管理者情報の編集</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
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
          <label className="block mb-1">権限</label>
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
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          更新する
        </button>
      </form>
    </div>
  );
}
