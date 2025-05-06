import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Doctor {
  id: number;
  name: string;
  department_name: string;
  facility_name: string;
}

export default function DoctorListPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isViewer = role === 'viewer';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, roleRes] = await Promise.all([
          axios.get('http://localhost:5000/doctors', { withCredentials: true }),
          axios.get('http://localhost:5000/auth/me', { withCredentials: true }),
        ]);
        setDoctors(doctorRes.data);
        setRole(roleRes.data.role);
      } catch (err) {
        console.error('データ取得エラー:', err);
        alert('医師情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/admin/doctors/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      await axios.delete(`http://localhost:5000/doctors/${id}`, {
        withCredentials: true,
      });
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">医師一覧</h1>

      {!isViewer && (
        <div className="mb-4 text-right">
          <button
            onClick={() => router.push('/admin/doctors/register')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            医師を登録
          </button>
        </div>
      )}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">氏名</th>
            <th className="border px-4 py-2">診療科</th>
            <th className="border px-4 py-2">施設</th>
            {!isViewer && <th className="border px-4 py-2">操作</th>}
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id}>
              <td className="border px-4 py-2">{doc.name}</td>
              <td className="border px-4 py-2">{doc.department_name}</td>
              <td className="border px-4 py-2">{doc.facility_name}</td>
              {!isViewer && (
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => handleEdit(doc.id)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:underline"
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
