import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof router.query.group_id === "string") {
      setGroupId(router.query.group_id);
    }
    if (typeof router.query.facility_id === "string") {
      setFacilityId(router.query.facility_id);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!groupId || !facilityId) {
      alert("URLに group_id と facility_id が必要です");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        phone,
        password,
        group_id: groupId,
        facility_id: facilityId,
      });

      console.log("✅ 登録成功:", res.data);
      setSuccess(true); // 成功時に画面切り替え
    } catch (err: any) {
      console.error("登録エラー:", err);
      setError(err.response?.data?.message || "登録に失敗しました");
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">登録完了</h1>
        <p>
          ご登録ありがとうございます。<br />
          ご登録されたメールアドレス宛にログインURLを送信しました。<br />
          メールをご確認ください。
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">利用者登録</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
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
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">電話番号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          登録する
        </button>
      </form>
    </div>
  );
}
