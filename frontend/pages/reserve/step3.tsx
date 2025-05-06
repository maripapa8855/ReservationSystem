import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Doctor {
  id: number;
  name: string;
}

export default function Step3SelectDoctor() {
  const router = useRouter();
  const { facility_id, department_id } = router.query;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  useEffect(() => {
    if (!facility_id || !department_id) return;

    axios
      .get(`http://localhost:5000/doctors?facility_id=${facility_id}&department_id=${department_id}`, {
        withCredentials: true,
      })
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('医師取得エラー:', err));
  }, [facility_id, department_id]);

  const handleNext = () => {
    if (selectedDoctor) {
      router.push({
        pathname: '/reserve/step4',
        query: { facility_id, department_id, doctor_id: selectedDoctor },
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

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        onClick={handleNext}
      >
        次へ進む
      </button>
    </div>
  );
}
