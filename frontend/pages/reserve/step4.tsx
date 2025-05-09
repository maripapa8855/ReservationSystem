import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Step4ConfirmReservation() {
  const router = useRouter();
  const { group_id, facility_id, department_id, doctor_id } = router.query;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [shifts, setShifts] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // シフト取得
  useEffect(() => {
    if (!group_id || !doctor_id) return;
    axios
      .get(`http://localhost:5000/schedules?group_id=${group_id}&doctor_id=${doctor_id}`, { withCredentials: true })
      .then((res) => setShifts(res.data))
      .catch((err) => console.error('シフト取得エラー:', err));
  }, [group_id, doctor_id]);

  // 時間選択肢生成
  useEffect(() => {
    if (!date || shifts.length === 0) return;

    const weekday = new Date(date).getDay();
    const shift = shifts.find((s) => s.weekday === weekday);
    if (!shift) {
      setAvailableTimes([]);
      return;
    }

    const times: string[] = [];
    let current = new Date(`2000-01-01T${shift.start_time}`);
    const end = new Date(`2000-01-01T${shift.end_time}`);
    while (current < end) {
      times.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + 30);
    }
    setAvailableTimes(times);
  }, [date, shifts]);

  // 上限チェック
  const checkAvailability = async () => {
    const res = await axios.get('http://localhost:5000/reservations/slot-count', {
      params: { group_id, doctor_id, date, time },
      withCredentials: true,
    });
    return res.data.count < res.data.capacity;
  };

  const handleReserve = async () => {
    if (!date || !time) {
      alert('日付と時間を選んでください');
      return;
    }

    const ok = await checkAvailability();
    if (!ok) {
      alert('その時間帯は予約が上限に達しています。別の時間をお選びください。');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/reservations',
        {
          group_id,
          facility_id,
          department_id,
          doctor_id,
          date,
          time,
        },
        { withCredentials: true }
      );
      router.push(`/reserve/complete?group_id=${group_id}&facility_id=${facility_id}`);
    } catch (err) {
      console.error('予約登録エラー:', err);
      alert('予約登録に失敗しました');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center">診療予約</h1>
      <p className="text-gray-600 text-center mb-6">ステップ 4 / 4：日時を選択して確定</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">日付を選択</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
      </div>

      {availableTimes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">時間を選択</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- 時間を選択 --</option>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        onClick={handleReserve}
      >
        予約を確定する
      </button>
    </div>
  );
}
