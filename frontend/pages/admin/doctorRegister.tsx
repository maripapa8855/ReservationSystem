import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorRegister() {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/admin/departments', { withCredentials: true })
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error('診療科取得失敗:', err));

    axios.get('http://localhost:5000/admin/facilities', { withCredentials: true })
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error('施設取得失敗:', err));
  }, []);

  const handleSubmit = async () => {
    if (!name || !departmentId || !facilityId) {
      alert('全ての項目を入力してください');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/admin/doctors', {
        name,
        department_id: departmentId,
        facility_id: facilityId,
      }, { withCredentials: true });

      alert('医師を登録しました');
      console.log(res.data);
      setName('');
      setDepartmentId('');
      setFacilityId('');
    } catch (err) {
      console.error('登録エラー:', err);
      alert('医師の登録に失敗しました');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👨‍⚕️ 医師登録</h2>

      <div>
        <label>医師名：</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label>診療科：</label>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">選択してください</option>
          {departments.map((dept: any) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>施設：</label>
        <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
          <option value="">選択してください</option>
          {facilities.map((fac: any) => (
            <option key={fac.id} value={fac.id}>{fac.name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleSubmit}>登録する</button>
    </div>
  );
}
