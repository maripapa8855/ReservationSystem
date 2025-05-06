import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Facility {
  id: number;
  name: string;
  location: string;
}

interface User {
  role: string;
}

export default function FacilityListPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const isViewer = user?.role === 'viewer';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/me', { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err);
        alert('ユーザー情報の取得に失敗しました');
        router.push('/login');
      }
    };

    const fetchFacilities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/facilities/by-admin', {
          withCredentials: true,
        });
        setFacilities(res.data);
      } catch (err) {
        console.error('施設一覧取得エラー:', err);
        alert('施設情報の取得に失敗しました');
      }
    };

    fetchUser().then(fetchFacilities);
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/admin/facilities/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      await axios.delete(`http://localhost:5000/facilities/${id}`, {
        withCredentials: true,
      });
      setFacilities(facilities.filter((f) => f.id !== id));
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">施設一覧</h1>

      {!isViewer && (
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/facilities/register')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ＋ 施設を追加
          </button>
        </div>
      )}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">施設名</th>
            <th className="border px-4 py-2">所在地</th>
            {!isViewer && <th className="border px-4 py-2">操作</th>}
          </tr>
        </thead>
        <tbody>
          {facilities.map((facility) => (
            <tr key={facility.id}>
              <td className="border px-4 py-2">{facility.id}</td>
              <td className="border px-4 py-2">{facility.name}</td>
              <td className="border px-4 py-2">{facility.location}</td>
              {!isViewer && (
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(facility.id)}
                    className="mr-2 text-blue-500 hover:underline"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(facility.id)}
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
