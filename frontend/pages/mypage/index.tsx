import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface Reservation {
  id: number;
  facility_name: string;
  date: string;
  time: string;
  status: string;
}

export default function MyPage() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/reservations/mypage', {
          params: { group_id, facility_id },
          withCredentials: true,
        });
        setReservations(res.data);
      } catch (err) {
        console.error('予約取得エラー:', err);
        setError('ログインしてください');
        router.push(`/login?group_id=${group_id}&facility_id=${facility_id}`);
      }
    };

    if (group_id && facility_id) {
      fetchReservations();
    }
  }, [group_id, facility_id]);

  const handleCancel = async (id: number) => {
    if (!confirm('この予約をキャンセルしますか？')) return;
    try {
      await axios.delete(`http://localhost:5000/reservations/${id}`, {
        params: { group_id, facility_id },
        withCredentials: true,
      });
      setReservations((prev) => prev.filter((r) => r.id !== id));
      alert('予約をキャンセルしました');
    } catch (err) {
      console.error('キャンセル失敗:', err);
      alert('キャンセルできませんでした');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">マイページ - 予約一覧</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {reservations.length === 0 ? (
        <p>予約はまだありません。</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">日付</th>
              <th className="p-2 border">時間</th>
              <th className="p-2 border">施設</th>
              <th className="p-2 border">ステータス</th>
              <th className="p-2 border">操作</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.date}</td>
                <td className="p-2 border">{r.time}</td>
                <td className="p-2 border">{r.facility_name}</td>
                <td className="p-2 border">{r.status}</td>
                <td className="p-2 border space-x-2">
                  <Link
                    href={`/reservations/edit/${r.id}?group_id=${group_id}&facility_id=${facility_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    編集
                  </Link>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleCancel(r.id)}
                  >
                    キャンセル
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
