import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, doctorsRes, departmentsRes, facilitiesRes] = await Promise.all([
        axios.get('http://localhost:5000/shifts', { withCredentials: true }),
        axios.get('http://localhost:5000/doctors', { withCredentials: true }),
        axios.get('http://localhost:5000/departments', { withCredentials: true }),
        axios.get('http://localhost:5000/facilities', { withCredentials: true }),
      ]);
      setShifts(shiftsRes.data);
      setDoctors(doctorsRes.data);
      setDepartments(departmentsRes.data);
      setFacilities(facilitiesRes.data);
    } catch (err) {
      console.error('データ取得エラー:', err);
    }
  };

  const getDoctorName = (id: number) => doctors.find((d) => d.id === id)?.name || `ID:${id}`;
  const getDepartmentName = (id: number) => departments.find((d) => d.id === id)?.name || `ID:${id}`;
  const getFacilityName = (id: number) => facilities.find((f) => f.id === id)?.name || `ID:${id}`;

  const handleEdit = (id: number) => {
    router.push(`/admin/shifts/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このシフトを本当に削除しますか？')) return;

    try {
      await axios.delete(`http://localhost:5000/shifts/${id}`, { withCredentials: true });
      alert('削除しました');
      fetchData(); // 再取得して反映
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>診療シフト一覧</h2>
      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>ID</th>
            <th>医師</th>
            <th>診療科</th>
            <th>施設</th>
            <th>開始</th>
            <th>終了</th>
            <th>最大患者数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift: any) => (
            <tr key={shift.id}>
              <td>{shift.id}</td>
              <td>{getDoctorName(shift.doctor_id)}</td>
              <td>{getDepartmentName(shift.department_id)}</td>
              <td>{getFacilityName(shift.facility_id)}</td>
              <td>{shift.start_time}</td>
              <td>{shift.end_time}</td>
              <td>{shift.max_patients_per_slot}</td>
              <td>
                <button onClick={() => handleEdit(shift.id)}>編集</button>{' '}
                <button onClick={() => handleDelete(shift.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
