import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Reservation {
  id: number;
  facility_name: string;
  date: string;
  time: string;
}

const MyPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/reservations', {
          withCredentials: true,
        });
        setReservations(res.data);
      } catch (err) {
        console.error('予約取得エラー:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [router]);

  const handleCancel = async (id: number) => {
    if (!confirm('本当にこの予約をキャンセルしますか？')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/reservations/${id}`, {
        withCredentials: true,
      });

      setReservations((prev) => prev.filter((resv) => resv.id !== id));
      setSuccessMessage('予約をキャンセルしました');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('キャンセルエラー:', err);
      alert('キャンセルに失敗しました');
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/mypage/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">マイページ</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">マイページ</h1>

      {/* 診療予約ボタン */}
      <div className="mb-6">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => router.push('/step2')}
        >
          新しく診療予約する
        </button>
      </div>

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {reservations.length === 0 ? (
        <p>現在、予約はありません。</p>
      ) : (
        <ul className="space-y-4">
          {reservations.map((resv) => (
            <li key={resv.id} className="border p-4 rounded shadow">
              <p><strong>施設名：</strong>{resv.facility_name}</p>
              <p><strong>日付：</strong>{resv.date}</p>
              <p><strong>時間：</strong>{resv.time}</p>
              <div className="mt-2 space-x-2">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => handleEdit(resv.id)}
                >
                  編集
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleCancel(resv.id)}
                >
                  キャンセル
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPage;
