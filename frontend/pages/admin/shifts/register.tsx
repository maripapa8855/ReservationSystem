// frontend/pages/admin/shifts/register.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function ShiftRegister() {
  const router = useRouter();
  const { facility_id, group_id } = router.query;

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxPatients, setMaxPatients] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/departments', {
        withCredentials: true,
      });
      setDepartments(res.data);
    } catch (err) {
      console.error('診療科取得エラー:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/doctors', {
        withCredentials: true,
      });
      setDoctors(res.data);
    } catch (err) {
      console.error('医師取得エラー:', err);
    }
  };

  const handleSubmit = async () => {
    if (!doctorId || !departmentId || !startTime || !endTime || !maxPatients) {
      alert('すべての項目を入力してください');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/shifts',
        {
          doctor_id: parseInt(doctorId),
          department_id: parseInt(departmentId),
          facility_id: parseInt(facility_id as string),
          group_id: parseInt(group_id as string),
          start_time: startTime,
          end_time: endTime,
          max_patients_per_slot: parseInt(maxPatients),
        },
        { withCredentials: true }
      );
      alert('診療時間を登録しました');
      router.push('/admin/shifts');
    } catch (err) {
      console.error('登録エラー:', err);
      alert('登録に失敗しました');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>診療時間の登録</h2>
      <div>
        <label>診療科：</label>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">選択してください</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>医師：</label>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          <option value="">選択してください</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>開始時間：</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>
      <div>
        <label>終了時間：</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <div>
        <label>1枠あたりの最大患者数：</label>
        <input type="number" value={maxPatients} onChange={(e) => setMaxPatients(e.target.value)} />
      </div>
      <button onClick={handleSubmit}>登録</button>
    </div>
  );
}
