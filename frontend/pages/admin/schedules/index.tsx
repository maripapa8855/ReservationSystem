import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

type Schedule = {
  id: number;
  doctor_id: number;
  doctor_name: string;
  weekday: number;
  start_time: string;
  end_time: string;
  capacity: number;
};

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export default function ScheduleIndex() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/schedules', { withCredentials: true });
      setSchedules(res.data);
    } catch (err) {
      console.error('取得失敗', err);
    }
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm('このシフトを削除しますか？')) return;
    try {
      await axios.delete(`/schedules/${id}`, { withCredentials: true });
      fetchSchedules(); // 再読み込み
    } catch (err) {
      console.error('削除失敗', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">シフト一覧</h1>
      <Link href="/admin/schedules/register" className="bg-blue-500 text-white px-4 py-2 rounded">
        ＋ 新規シフト登録
      </Link>

      <table className="mt-4 w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">医師名</th>
            <th className="border px-2 py-1">曜日</th>
            <th className="border px-2 py-1">時間帯</th>
            <th className="border px-2 py-1">定員</th>
            <th className="border px-2 py-1">操作</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td className="border px-2 py-1">{s.doctor_name}</td>
              <td className="border px-2 py-1">{weekdayLabels[s.weekday]}</td>
              <td className="border px-2 py-1">{s.start_time}〜{s.end_time}</td>
              <td className="border px-2 py-1">{s.capacity}</td>
              <td className="border px-2 py-1">
                <Link href={`/admin/schedules/edit/${s.id}`} className="text-blue-600 mr-2">編集</Link>
                <button onClick={() => deleteSchedule(s.id)} className="text-red-600">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
