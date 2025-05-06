import { useEffect, useState } from 'react';
import axios from 'axios';

interface Doctor {
  id: number;
  name: string;
  department_name: string;
  facility_name: string;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/doctors', {
        withCredentials: true,
      });
      setDoctors(res.data);
    } catch (err) {
      console.error('医師一覧取得エラー:', err);
    }
  };

  const handleEdit = (id: number) => {
    alert(`編集機能は未実装ですが、ID ${id} を編集予定です。`);
    // 例: router.push(`/doctor/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この医師を削除してもよろしいですか？')) return;
    try {
      await axios.delete(`http://localhost:5000/doctors/${id}`, {
        withCredentials: true,
      });
      fetchDoctors(); // 再読み込み
    } catch (err) {
      console.error('削除エラー:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>医師一覧</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>診療科</th>
            <th>施設</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td>{doc.name}</td>
              <td>{doc.department_name}</td>
              <td>{doc.facility_name}</td>
              <td>
                <button onClick={() => handleEdit(doc.id)}>編集</button>{' '}
                <button onClick={() => handleDelete(doc.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
