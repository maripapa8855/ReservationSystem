import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function RegisterGroup() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/groups",
        { name },
        { withCredentials: true }
      );
      router.push("/admin/group");
    } catch (error) {
      console.error("登録失敗:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">施設グループ登録</h1>
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
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録
        </button>
      </form>
    </div>
  );
}
