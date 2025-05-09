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
        <input type="text" name="name" placeholder="名前" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="email" name="email" placeholder="メールアドレス" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="text" name="phone" placeholder="電話番号" onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="password" name="password" placeholder="パスワード" onChange={handleChange} required className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          登録
        </button>
      </form>
    </div>
  );
}
