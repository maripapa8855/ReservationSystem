import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Doctor {
  id: number;
  name: string;
}

export default function Step3SelectDoctor() {
  const router = useRouter();
  const { group_id, facility_id, department_id } = router.query;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [facilityName, setFacilityName] = useState('');
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    if (!group_id || !facility_id || !department_id) return;

    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/doctors?group_id=${group_id}&facility_id=${facility_id}&department_id=${department_id}`,
          { withCredentials: true }
        );
        setDoctors(res.data);
      } catch (err) {
        console.error('医師取得エラー:', err);
      }
    };

    const fetchFacility = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/facilities/${facility_id}`);
        setFacilityName(res.data.name);
      } catch (err) {
        setFacilityName('(取得失敗)');
      }
    };

    const fetchDepartment = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/departments/${department_id}`
        );
        setDepartmentName(res.data.name);
      } catch (err) {
        setDepartmentName('(取得失敗)');
      }
    };

    fetchDoctors();
    fetchFacility();
    fetchDepartment();
  }, [group_id, facility_id, department_id]);

  const handleNext = () => {
    if (selectedDoctor) {
      router.push({
        pathname: '/reserve/step4',
        query: {
          group_id,
          facility_id,
          department_id,
          doctor_id: selectedDoctor,
        },
      });
    } else {
      alert('医師を選択してください');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center">診療予約</h1>
      <p className="text-gray-600 text-center mb-6">ステップ 3 / 4：医師を選択</p>

      <div className="mb-6">
        <label htmlFor="doctor" className="block text-sm font-medium mb-1">
          医師を選択してください
        </label>
        <select
          id="doctor"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={selectedDoctor ?? ''}
          onChange={(e) => setSelectedDoctor(Number(e.target.value))}
        >
          <option value="">-- 医師を選んでください --</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>

      {/* 選択情報表示（ボタンの直上） */}
      <div className="text-sm text-gray-700 mb-4">
        <p>選択中の施設：{facilityName}</p>
        <p>選択中の診療科：{departmentName}</p>
      </div>

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        onClick={handleNext}
      >
        次へ進む
      </button>
    </div>
  );
}
