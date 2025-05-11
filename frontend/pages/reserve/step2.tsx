import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface Department {
  id: number;
  name: string;
}

interface Facility {
  id: number;
  name: string;
}

export default function Step2SelectDepartment() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [facilityName, setFacilityName] = useState<string>("");

  useEffect(() => {
    if (!group_id || !facility_id) return;

    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/departments?group_id=${group_id}&facility_id=${facility_id}`,
          { withCredentials: true }
        );
        setDepartments(res.data);
      } catch (err) {
        console.error("診療科取得エラー:", err);
      }
    };

    const fetchFacility = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/facilities/${facility_id}`);
        setFacilityName(res.data.name);
      } catch (err) {
        console.error("施設名取得エラー:", err);
        setFacilityName("施設名取得失敗");
      }
    };

    fetchDepartments();
    fetchFacility();
  }, [group_id, facility_id]);

  const handleNext = () => {
    if (selectedDepartment) {
      router.push({
        pathname: "/reserve/step3",
        query: {
          group_id,
          facility_id,
          department_id: selectedDepartment,
        },
      });
    } else {
      alert("診療科を選択してください");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center">診療予約</h1>
      <p className="text-gray-600 text-center mb-6">
        ステップ 2 / 4：診療科を選択<br />
        <span className="text-sm text-gray-700">施設: {facilityName}</span>
      </p>

      <div className="mb-6">
        <label htmlFor="department" className="block text-sm font-medium mb-1">
          診療科を選択してください
        </label>
        <select
          id="department"
          className="border border-gray-300 rounded px-3 py-2 w-full"
          value={selectedDepartment ?? ""}
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

      {selectedDepartment && (
        <p className="text-sm text-gray-700 text-center mb-4">
          選択中の診療科: {departments.find((d) => d.id === selectedDepartment)?.name}
        </p>
      )}

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        onClick={handleNext}
      >
        次へ進む
      </button>
    </div>
  );
}
