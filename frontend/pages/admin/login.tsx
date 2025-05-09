import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "facilityadmin",
    group_id: 1,
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/admin/register", form, {
        withCredentials: true,
      });
      alert(res.data.message || "登録成功");
      router.push("/admin/login");
    } catch (err: any) {
      console.error("登録エラー:", err);
      setError(err.response?.data?.message || "登録に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">管理者登録</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1">名前</label>
          <input
            type="text"
            name="name"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">メールアドレス</label>
          <input
            type="email"
            name="email"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">電話番号</label>
          <input
            type="text"
            name="phone"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">パスワード</label>
          <input
            type="password"
            name="password"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">グループID</label>
          <input
            type="number"
            name="group_id"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">役割</label>
          <input
            type="text"
            name="role"
            className="p-2 border rounded"
            value={form.role}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          登録
        </button>
      </form>
    </div>
  );
}
