import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function DepartmentEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 認証チェック → データ取得
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then(() => {
        setAuthChecked(true);
        fetchDepartment();
      })
      .catch(() => router.push("/admin/login"));
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/departments/${id}`, {
        withCredentials: true,
      });
      setName(res.data.name);
    } catch (err) {
      console.error("診療科取得失敗:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/departments/${id}`,
        { name },
        { withCredentials: true }
      );
      router.push("/admin/departments");
    } catch (err) {
      console.error("更新失敗:", err);
      alert("更新に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">診療科編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">診療科名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
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
