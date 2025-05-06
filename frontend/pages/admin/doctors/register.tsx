import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

type Department = { id: number; name: string };
type Facility = { id: number; name: string; group_id: number };

export default function DoctorRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 認証＋group_id 取得
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then((res) => {
        setGroupId(res.data.group_id);
        setAuthChecked(true);
      })
      .catch(() => router.push("/admin/login"));
  }, []);

  useEffect(() => {
    if (groupId) {
      axios
        .get("http://localhost:5000/facilities", { withCredentials: true })
        .then((res) =>
          setFacilities(res.data.filter((f: Facility) => f.group_id === groupId))
        );
    }
  }, [groupId]);

  useEffect(() => {
    if (facilityId) {
      axios
        .get(`http://localhost:5000/departments?facility_id=${facilityId}`, {
          withCredentials: true,
        })
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error("診療科取得エラー:", err));
    } else {
      setDepartments([]);
    }
  }, [facilityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/doctors",
        {
          name,
          department_id: departmentId,
          facility_id: facilityId,
        },
        { withCredentials: true }
      );
      router.push("/admin/doctors");
    } catch (err) {
      console.error("登録失敗:", err);
      alert("登録に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">医師登録</h1>
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

        <div>
          <label className="block mb-1">診療科</label>
          <select
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            required
            disabled={!facilityId}
          >
            <option value="" disabled>
              {facilityId ? "診療科を選択" : "先に施設を選択してください"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </form>
    </div>
  );
}
