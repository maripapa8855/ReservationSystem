import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Department {
  id: number;
  name: string;
  facility_name: string;
}

export default function DepartmentListPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/departments', { withCredentials: true });
        setDepartments(res.data);
      } catch (err) {
        console.error('診療科一覧取得エラー:', err);
      }
    };

    const fetchRole = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/me', { withCredentials: true });
        setRole(res.data.role);
      } catch (err) {
        console.error('ロール取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
    fetchRole();
  }, []);

  const handleRegister = () => {
    router.push('/admin/departments/register');
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/departments/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await axios.delete(`http://localhost:5000/departments/${id}`, { withCredentials: true });
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">診療科一覧</h1>

      {role !== 'viewer' && (
        <div className="mb-4 text-right">
          <button
            onClick={handleRegister}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            診療科を登録
          </button>
        </div>
      )}

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">診療科名</th>
            <th className="border px-4 py-2">施設名</th>
            {role !== 'viewer' && <th className="border px-4 py-2">操作</th>}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td className="border px-4 py-2">{dept.name}</td>
              <td className="border px-4 py-2">{dept.facility_name}</td>
              {role !== 'viewer' && (
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleEdit(dept.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
