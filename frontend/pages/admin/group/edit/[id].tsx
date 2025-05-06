import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function EditGroup() {
  const router = useRouter();
  const { id } = router.query;
  const [name, setName] = useState("");

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:5000/groups/${id}`, { withCredentials: true })
        .then((res) => setName(res.data.name))
        .catch((err) => console.error("データ取得失敗:", err));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/groups/${id}`,
        { name },
        { withCredentials: true }
      );
      router.push("/admin/group");
    } catch (err) {
      console.error("更新失敗:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">施設グループ編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">グループ名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border px-3 py-2 rounded w-full"
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
