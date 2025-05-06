import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Group = {
  id: number;
  name: string;
};

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/groups", {
        withCredentials: true,
      });
      setGroups(res.data);
    } catch (err) {
      console.error("グループ取得エラー:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`http://localhost:5000/groups/${id}`, {
        withCredentials: true,
      });
      setGroups(groups.filter((group) => group.id !== id));
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">施設グループ一覧</h1>
      <Link
        href="/admin/group/register"
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        ＋ 新しいグループを登録
      </Link>

      <table className="table-auto w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">グループ名</th>
            <th className="border px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td className="border px-4 py-2">{group.id}</td>
              <td className="border px-4 py-2">{group.name}</td>
              <td className="border px-4 py-2 space-x-2">
                <Link
                  href={`/admin/group/edit/${group.id}`}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
