import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  group_id: number;
  group_name: string;
  deleted_at: string | null;
}

export default function AdminListPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/admins", {
        withCredentials: true,
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("管理者一覧取得エラー:", err);
      alert("管理者一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("この管理者を削除しますか？")) return;

    try {
      await axios.delete(`http://localhost:5000/admin/admins/${id}`, {
        withCredentials: true,
      });
      alert("削除しました");
      fetchAdmins();
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("この管理者を復元しますか？")) return;

    try {
      await axios.post(`http://localhost:5000/admin/admins/${id}/restore`, {}, {
        withCredentials: true,
      });
      alert("復元しました");
      fetchAdmins();
    } catch (err) {
      console.error("復元エラー:", err);
      alert("復元に失敗しました");
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
              <th className="border px-4 py-2">電話番号</th>
              <th className="border px-4 py-2">ロール</th>
              <th className="border px-4 py-2">法人名</th>
              <th className="border px-4 py-2">状態</th>
              <th className="border px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="border px-4 py-2">{admin.id}</td>
                <td className="border px-4 py-2">{admin.name}</td>
                <td className="border px-4 py-2">{admin.email}</td>
                <td className="border px-4 py-2">{admin.phone}</td>
                <td className="border px-4 py-2">{admin.role}</td>
                <td className="border px-4 py-2">{admin.group_name}</td>
                <td className="border px-4 py-2">
                  {admin.deleted_at ? "削除済み" : "有効"}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(admin.id)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    編集
                  </button>
                  {admin.deleted_at ? (
                    <button
                      onClick={() => handleRestore(admin.id)}
                      className="text-green-600 hover:underline"
                    >
                      復元
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:underline"
                    >
                      削除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
