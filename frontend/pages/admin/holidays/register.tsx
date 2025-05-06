import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

type Facility = { id: number; name: string };
type Department = { id: number; name: string };

export default function HolidayRegister() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then(() => {
        setAuthChecked(true);
        return axios.get("http://localhost:5000/facilities", {
          withCredentials: true,
        });
      })
      .then((res) => setFacilities(res.data))
      .catch(() => router.push("/admin/login"));
  }, []);

  useEffect(() => {
    if (!facilityId) return;
    axios
      .get(`http://localhost:5000/departments?facility_id=${facilityId}`, {
        withCredentials: true,
      })
      .then((res) => setDepartments(res.data))
      .catch((err) => {
        console.error("診療科取得エラー", err);
        setDepartments([]);
      });
  }, [facilityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/holidays",
        {
          closed_date: date,
          reason,
          facility_id: facilityId,
          department_id: departmentId,
        },
        { withCredentials: true }
      );
      router.push("/admin/holidays");
    } catch (err) {
      console.error("登録失敗:", err);
      alert("登録に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">休診日登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">理由</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">施設</label>
          <select
            value={facilityId ?? ""}
            onChange={(e) => setFacilityId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="" disabled>施設を選択してください</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">診療科</label>
          <select
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
            disabled={!facilityId}
          >
            <option value="" disabled>診療科を選択してください</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          登録
        </button>
      </form>
    </div>
  );
}
