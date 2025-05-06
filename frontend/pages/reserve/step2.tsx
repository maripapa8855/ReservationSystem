import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
}

export default function Step2SelectDepartment() {
  const router = useRouter();
  const { facility_id } = router.query;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  useEffect(() => {
    if (!facility_id) return;

    axios
      .get(`http://localhost:5000/departments?facility_id=${facility_id}`, { withCredentials: true })
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error('診療科取得エラー:', err));
  }, [facility_id]);

  const handleNext = () => {
    if (selectedDepartment) {
      router.push({
        pathname: '/reserve/step3',
        query: { facility_id, department_id: selectedDepartment },
      });
    } else {
      alert('診療科を選択してください');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center">診療予約</h1>
      <p className="text-gray-600 text-center mb-6">ステップ 2 / 4：診療科を選択</p>

      <div className="mb-6">
        <label htmlFor="department" className="block text-sm font-medium mb-1">
          診療科を選択してください
        </label>
        <select
          id="department"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={selectedDepartment ?? ''}
          onChange={(e) => setSelectedDepartment(Number(e.target.value))}
        >
          <option value="">-- 診療科を選んでください --</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
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
