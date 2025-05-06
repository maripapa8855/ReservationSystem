import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

type Department = { id: number; name: string };
type Facility = { id: number; name: string };

export default function DoctorEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!id) return;

    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then(() => {
        setAuthChecked(true);
        fetchDoctor();
        fetchDepartments();
        fetchFacilities();
      })
      .catch(() => router.push("/admin/login"));
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/doctors/${id}`, {
        withCredentials: true,
      });
      setName(res.data.name);
      setDepartmentId(res.data.department_id);
      setFacilityId(res.data.facility_id);
    } catch (err) {
      console.error("医師データ取得失敗:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/departments", {
        withCredentials: true,
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("診療科取得エラー:", err);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/facilities", {
        withCredentials: true,
      });
      setFacilities(res.data);
    } catch (err) {
      console.error("施設取得エラー:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/doctors/${id}`,
        {
          name,
          department_id: departmentId,
          facility_id: facilityId,
        },
        { withCredentials: true }
      );
      router.push("/admin/doctors");
    } catch (err) {
      console.error("更新失敗:", err);
      alert("更新に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">医師編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">診療科</label>
          <select
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="" disabled>
              診療科を選択
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">施設</label>
          <select
            value={facilityId ?? ""}
            onChange={(e) => setFacilityId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="" disabled>
              施設を選択
            </option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          保存
        </button>
      </form>
    </div>
  );
}
