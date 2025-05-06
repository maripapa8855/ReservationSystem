import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../../utils/withAuth';

function EditReservationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    facility_id: '',
    department_id: '',
    doctor_id: '',
    date: '',
    time: '',
    visit_type: '新患',
    status: '予約済',
  });

  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [shiftError, setShiftError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchOptions();
    fetchReservation();
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [facRes, depRes, docRes] = await Promise.all([
        axios.get('http://localhost:5000/facilities', { withCredentials: true }),
        axios.get('http://localhost:5000/departments', { withCredentials: true }),
        axios.get('http://localhost:5000/doctors', { withCredentials: true })
      ]);
      setFacilities(facRes.data);
      setDepartments(depRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error('選択肢の取得エラー:', err);
    }
  };

  const fetchReservation = async () => {
    try {
      const res = await axios.get('http://localhost:5000/reservations', { withCredentials: true });
      const reservation = res.data.find((r: any) => r.id.toString() === id);
      if (reservation) {
        setFormData({
          facility_id: reservation.facility_id,
          department_id: reservation.department_id,
          doctor_id: reservation.doctor_id,
          date: reservation.date,
          time: reservation.time,
          visit_type: reservation.visit_type,
          status: reservation.status,
        });

        const docRes = await axios.get('http://localhost:5000/doctors', { withCredentials: true });
        const selectedDoctor = docRes.data.find((d: any) => d.id === reservation.doctor_id);
        if (selectedDoctor?.available_days) {
          setAvailableDays(selectedDoctor.available_days);
        }
      }
    } catch (err) {
      console.error('予約取得エラー:', err);
    }
  };

  const checkShift = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/shifts/check?doctor_id=${formData.doctor_id}&department_id=${formData.department_id}&time=${formData.time}`, {
        withCredentials: true,
      });
      return res.data.ok;
    } catch (err) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'doctor_id') {
      const selected = doctors.find((d: any) => d.id.toString() === value);
      if (selected?.available_days) {
        setAvailableDays(selected.available_days);
      } else {
        setAvailableDays([]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShiftError('');

    if (!formData.facility_id || !formData.department_id || !formData.doctor_id || !formData.date || !formData.time) {
      setError('すべての項目を入力してください');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
      setError('過去の日付は選択できません');
      return;
    }

    const selectedDay = new Date(formData.date).getDay();
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setError('この曜日は診療対象外です');
      return;
    }

    const shiftOk = await checkShift();
    if (!shiftOk) {
      setShiftError('この時間帯には診療枠がありません');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/reservations/${id}`, formData, {
        withCredentials: true,
      });
      alert('予約情報を更新しました');
      router.push('/reservations');
    } catch (err) {
      console.error('更新エラー:', err);
      alert('更新に失敗しました');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>予約情報の編集</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {shiftError && <p style={{ color: 'red' }}>{shiftError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>施設：</label>
          <select name="facility_id" value={formData.facility_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {facilities.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>診療科：</label>
          <select name="department_id" value={formData.department_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>医師：</label>
          <select name="doctor_id" value={formData.doctor_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {doctors.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>日付：</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>
        <div>
          <label>時間：</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>
        <div>
          <label>区分：</label>
          <select name="visit_type" value={formData.visit_type} onChange={handleChange}>
            <option value="新患">新患</option>
            <option value="再診">再診</option>
          </select>
        </div>
        <div>
          <label>状態：</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="予約済">予約済</option>
            <option value="キャンセル">キャンセル</option>
            <option value="完了">完了</option>
          </select>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">更新する</button>
          <button type="button" onClick={() => router.push('/reservations')} style={{ marginLeft: '1rem' }}>戻る</button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EditReservationPage);
