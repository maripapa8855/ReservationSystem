import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

type Doctor = {
  id: number;
  name: string;
};

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export default function ScheduleRegister() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [weekday, setWeekday] = useState('1'); // 月曜
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [capacity, setCapacity] = useState('32');

  useEffect(() => {
    axios.get('/doctors', { withCredentials: true }).then((res) => {
      setDoctors(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        '/schedules',
        {
          doctor_id: Number(doctorId),
          weekday: Number(weekday),
          start_time: startTime,
          end_time: endTime,
          capacity: Number(capacity),
        },
        { withCredentials: true }
      );
      router.push('/admin/schedules');
    } catch (err) {
      console.error('登録失敗', err);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">新規シフト登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>医師</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required className="block border p-1">
            <option value="">選択してください</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>曜日</label>
          <select value={weekday} onChange={(e) => setWeekday(e.target.value)} className="block border p-1">
            {weekdayLabels.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label>開始時間</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="block border p-1" />
        </div>

        <div>
          <label>終了時間</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="block border p-1" />
        </div>

        <div>
          <label>定員（1時間に何人まで）</label>
          <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="block border p-1" />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>
    </div>
  );
}
