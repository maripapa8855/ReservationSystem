import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function EditShift() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState({
    doctor_id: '',
    department_id: '',
    facility_id: '',
    start_time: '',
    end_time: '',
    max_patients_per_slot: '',
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (id) {
      fetchShift();
      fetchOptions();
    }
  }, [id]);

  const fetchShift = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/shifts/${id}`, {
        withCredentials: true,
      });
      const shift = res.data;
      setForm({
        doctor_id: shift.doctor_id.toString(),
        department_id: shift.department_id.toString(),
        facility_id: shift.facility_id?.toString() || '',
        start_time: shift.start_time,
        end_time: shift.end_time,
        max_patients_per_slot: shift.max_patients_per_slot.toString(),
      });
    } catch (err) {
      console.error('シフト取得エラー:', err);
    }
  };

  const fetchOptions = async () => {
    try {
      const [docRes, deptRes, facRes] = await Promise.all([
        axios.get('http://localhost:5000/doctors', { withCredentials: true }),
        axios.get('http://localhost:5000/departments', { withCredentials: true }),
        axios.get('http://localhost:5000/facilities', { withCredentials: true }),
      ]);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
      setFacilities(facRes.data);
    } catch (err) {
      console.error('選択肢取得エラー:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/shifts/${id}`,
        {
          ...form,
          doctor_id: parseInt(form.doctor_id),
          department_id: parseInt(form.department_id),
          facility_id: parseInt(form.facility_id),
          max_patients_per_slot: parseInt(form.max_patients_per_slot),
        },
        { withCredentials: true }
      );
      alert('更新しました');
      router.push('/admin/shifts');
    } catch (err) {
      console.error('更新エラー:', err);
      alert('更新に失敗しました');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>シフト編集</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>医師：</label>
          <select name="doctor_id" value={form.doctor_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>診療科：</label>
          <select name="department_id" value={form.department_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>施設：</label>
          <select name="facility_id" value={form.facility_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>開始時間：</label>
          <input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
        </div>
        <div>
          <label>終了時間：</label>
          <input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
        </div>
        <div>
          <label>最大患者数：</label>
          <input type="number" name="max_patients_per_slot" value={form.max_patients_per_slot} onChange={handleChange} />
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  );
}
