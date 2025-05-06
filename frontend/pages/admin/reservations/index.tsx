import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Reservation {
  id: number;
  user_name: string;
  facility_name: string;
  department_name: string;
  date: string;
  time: string;
  status: string;
  visit_type: string;
}

export default function AdminReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [date, setDate] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/me', { withCredentials: true });
        setRole(userRes.data.role);

        if (userRes.data.role === 'facility_admin') {
          const facilityRes = await axios.get(`http://localhost:5000/facilities/by-admin`, { withCredentials: true });
          setFacilities([facilityRes.data]);
          setFacilityId(facilityRes.data.id);
        } else if (userRes.data.role === 'group_admin') {
          const allFacilities = await axios.get(`http://localhost:5000/facilities`, { withCredentials: true });
          setFacilities(allFacilities.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('管理者情報取得エラー:', err);
        alert('ログインが必要です');
        router.push('/login');
      }
    };

    fetchInitialData();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/reservations/admin', {
        params: {
          facility_id: facilityId,
          date,
        },
        withCredentials: true,
      });
      setReservations(res.data);
    } catch (err) {
      console.error('予約取得エラー:', err);
      alert('予約情報の取得に失敗しました');
    }
  };

  if (loading) return <p className="p-4">読み込み中...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">予約一覧（管理者）</h1>

      <div className="flex items-center space-x-4 mb-4">
        {role === 'group_admin' && (
          <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className="border rounded px-2 py-1">
            <option value="">施設を選択</option>
            {facilities.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          onClick={fetchReservations}
        >
          検索
        </button>
      </div>

      {reservations.length === 0 ? (
        <p>該当する予約はありません。</p>
      ) : (
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">日付</th>
              <th className="border px-2 py-1">時間</th>
              <th className="border px-2 py-1">施設</th>
              <th className="border px-2 py-1">診療科</th>
              <th className="border px-2 py-1">利用者</th>
              <th className="border px-2 py-1">区分</th>
              <th className="border px-2 py-1">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.date}</td>
                <td className="border px-2 py-1">{r.time}</td>
                <td className="border px-2 py-1">{r.facility_name}</td>
                <td className="border px-2 py-1">{r.department_name}</td>
                <td className="border px-2 py-1">{r.user_name}</td>
                <td className="border px-2 py-1">{r.visit_type}</td>
                <td className="border px-2 py-1">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
