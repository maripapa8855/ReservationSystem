import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      }, {
        withCredentials: true
      });
      
      alert(response.data.message);
      router.push('/reserve/step2'); // ログイン後に予約画面へ
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.response?.data?.message || 'ログインに失敗しました');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>ログイン</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>メールアドレス：</label><br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>パスワード：</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">ログイン</button>
      </form>

      <div style={{ marginTop: '10px' }}>
        <p>
          アカウントをお持ちでない方は <a href="/register">新規登録</a><br />
          パスワードをお忘れの方は <a href="/change-password">こちら</a>
        </p>
      </div>
    </div>
  );
}
