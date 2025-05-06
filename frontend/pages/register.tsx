import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const { group_id } = router.query; // ← ここに追記
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('http://localhost:5000/auth/register', {
        name,
        email,
        phone,
        password,
        role: 'viewer',
        group_id: Number(group_id)
      }, { withCredentials: true });

      setSuccess('登録に成功しました！ログイン画面へ移動します。');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
        setError('登録に失敗しました');
      } else {
        console.error(err);
        setError('不明なエラーが発生しました');
      }
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">ユーザー登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">名前</label>
          <input name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">メールアドレス</label>
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">電話番号</label>
          <input name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">登録する</button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
}
