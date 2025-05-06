import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function DepartmentRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then(() => setAuthChecked(true))
      .catch(() => router.push("/admin/login"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/departments",
        { name },
        { withCredentials: true }
      );
      router.push("/admin/departments");
    } catch (err) {
      console.error("登録失敗:", err);
      alert("登録に失敗しました");
    }
  };

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">診療科登録</h1>
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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </form>
    </div>
  );
}
