import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  group_id: number;
}

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admins", {
          withCredentials: true,
        });
        setAdmins(res.data);
      } catch (err) {
        console.error("管理者一覧取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("この管理者を削除しますか？")) return;

    try {
      await axios.delete(`http://localhost:5000/users/${id}`, {
        withCredentials: true,
      });
      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
      alert("削除しました");
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/admins/edit/${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">管理者一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">名前</th>
              <th className="border px-4 py-2">メール</th>
              <th className="border px-4 py-2">ロール</th>
              <th className="border px-4 py-2">グループID</th>
              <th className="border px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="border px-4 py-2">{admin.id}</td>
                <td className="border px-4 py-2">{admin.name}</td>
                <td className="border px-4 py-2">{admin.email}</td>
                <td className="border px-4 py-2">{admin.role}</td>
                <td className="border px-4 py-2">{admin.group_id}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(admin.id)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
