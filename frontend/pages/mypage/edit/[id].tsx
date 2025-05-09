import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Reservation {
  id: number;
  doctor_id: number;
  department_id: number;
  facility_id: number;
  date: string;
  time: string;
  status: string;
  visit_type: string;
}

export default function EditReservationPage() {
  const router = useRouter();
  const { id, group_id, facility_id } = router.query;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [facility, setFacility] = useState<any>(null);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('');
  const [visitType, setVisitType] = useState('');

  useEffect(() => {
    if (!id || !group_id || !facility_id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/reservations/${id}`, { withCredentials: true });
        const data = res.data;
        setReservation(data);
        setTime(data.time);
        setStatus(data.status);
        setVisitType(data.visit_type);

        const [shiftsRes, facilityRes, holidaysRes] = await Promise.all([
          axios.get(`http://localhost:5000/shifts?group_id=${group_id}&doctor_id=${data.doctor_id}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/facilities/${data.facility_id}?group_id=${group_id}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/holidays?facility_id=${data.facility_id}`, { withCredentials: true }),
        ]);

        setShifts(shiftsRes.data);
        setFacility(facilityRes.data);
        setClosedDays(holidaysRes.data.map((h: any) => h.date));
      } catch (err) {
        console.error('読み込みエラー:', err);
        alert('予約情報の取得に失敗しました');
        router.push(`/mypage?group_id=${group_id}&facility_id=${facility_id}`);
      }
    };

    fetchData();
  }, [id, group_id, facility_id]);

  const generateTimeOptions = () => {
    const options: string[] = [];
    shifts.forEach((shift) => {
      let current = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      while (current < end) {
        options.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + 30);
      }
    });
    return options;
  };

  const validateUpdate = (): boolean => {
    if (!reservation || !facility) return false;

    const selectedDateTime = new Date(`${reservation.date}T${time}`);
    const now = new Date();

    if (closedDays.includes(reservation.date)) {
      alert('この日は休診日のため予約できません。');
      return false;
    }

    const maxDays = facility.max_reservation_days ?? 30;
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + maxDays);
    if (selectedDateTime > maxDate) {
      alert(`この施設では ${maxDays} 日先までしか予約できません。`);
      return false;
    }

    const minHours = facility.min_hours_before_reservation ?? 1;
    const minLimit = new Date(now.getTime() + minHours * 60 * 60 * 1000);
    if (selectedDateTime < minLimit) {
      alert(`${minHours} 時間以上前に予約してください。`);
      return false;
    }

    if (status === 'キャンセル') {
      const minCancelHours = facility.min_hours_before_cancel ?? 2;
      const cancelLimit = new Date(now.getTime() + minCancelHours * 60 * 60 * 1000);
      if (selectedDateTime < cancelLimit) {
        alert(`${minCancelHours} 時間以内の予約はキャンセルできません。`);
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateUpdate()) return;

    try {
      await axios.put(`http://localhost:5000/reservations/${id}`, {
        doctor_id: reservation?.doctor_id,
        department_id: reservation?.department_id,
        facility_id: reservation?.facility_id,
        date: reservation?.date,
        time,
        visit_type: visitType,
        status,
      }, { withCredentials: true });

      alert('予約を更新しました');
      router.push(`/mypage?group_id=${group_id}&facility_id=${facility_id}`);
    } catch (err) {
      console.error('更新エラー:', err);
      alert('予約更新に失敗しました');
    }
  };

  if (!reservation || !facility) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">予約編集</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">予約編集</h1>

      <p className="mb-4">施設: <strong>{facility.name}</strong></p>
      <p className="mb-4">日付: <strong>{reservation.date}</strong></p>

      <div className="mb-4">
        <label className="block mb-1">時間を選択</label>
        <select value={time} onChange={(e) => setTime(e.target.value)} className="border rounded px-3 py-2 w-full">
          <option value="">選択してください</option>
          {generateTimeOptions().map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">区分</label>
        <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className="border rounded px-3 py-2 w-full">
          <option value="新患">新患</option>
          <option value="再診">再診</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-1">ステータス</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2 w-full">
          <option value="予約中">予約中</option>
          <option value="確定">確定</option>
          <option value="キャンセル">キャンセル</option>
        </select>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        更新する
      </button>
    </div>
  );
}
