import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

type Doctor = {
  id: number;
  name: string;
};

type Schedule = {
  id: number;
  doctor_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  capacity: number;
};

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export default function EditSchedule() {
  const router = useRouter();
  const { id } = router.query;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState<Schedule | null>(null);

  // 医師一覧の取得
  useEffect(() => {
    axios.get('/doctors', { withCredentials: true }).then((res) => {
      setDoctors(res.data);
    });
  }, []);

  // 対象スケジュールの取得
  useEffect(() => {
    if (!id) return;
    axios.get('/schedules', { withCredentials: true }).then((res) => {
      const target = res.data.find((s: Schedule) => s.id === Number(id));
      if (target) setForm(target);
    });
  }, [id]);

  const handleChange = (field: keyof Schedule, value: string | number) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      await axios.put(`/schedules/${form.id}`, {
        doctor_id: form.doctor_id,
        weekday: form.weekday,
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: form.capacity,
      }, { withCredentials: true });
      router.push('/admin/schedules');
    } catch (err) {
      console.error('更新失敗', err);
      alert('更新に失敗しました');
    }
  };

  if (!form) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">シフト編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>医師</label>
          <select
            value={form.doctor_id}
            onChange={(e) => handleChange('doctor_id', Number(e.target.value))}
            required
            className="block border p-1"
          >
            <option value="">選択してください</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>曜日</label>
          <select
            value={form.weekday}
            onChange={(e) => handleChange('weekday', Number(e.target.value))}
            className="block border p-1"
          >
            {weekdayLabels.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label>開始時間</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => handleChange('start_time', e.target.value)}
            className="block border p-1"
          />
        </div>

        <div>
          <label>終了時間</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => handleChange('end_time', e.target.value)}
            className="block border p-1"
          />
        </div>

        <div>
          <label>定員</label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => handleChange('capacity', Number(e.target.value))}
            className="block border p-1"
          />
        </div>

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          更新
        </button>
      </form>
    </div>
  );
}
