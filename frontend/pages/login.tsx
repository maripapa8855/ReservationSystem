import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [loadingFacility, setLoadingFacility] = useState(true);

  // 施設名を取得（クエリ未指定時はリダイレクト）
  useEffect(() => {
    if (!group_id || !facility_id) {
      alert('グループまたは施設情報が指定されていません。トップページへ戻ります。');
      router.push('/');
      return;
    }

    axios
      .get(`http://localhost:5000/facilities/${facility_id}`, {
        params: { group_id },
      })
      .then(response => {
        setFacilityName(response.data.name);
      })
      .catch(error => {
        console.error('施設情報取得エラー:', error);
        setFacilityName('施設名取得失敗');
      })
      .finally(() => setLoadingFacility(false));
  }, [group_id, facility_id, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/auth/login',
        {
          email,
          password,
          group_id,
          facility_id,
        },
        { withCredentials: true }
      );

      alert(response.data.message);
      router.push(`/reserve/step2?group_id=${group_id}&facility_id=${facility_id}`);
    } catch (err: any) {
      console.error('ログインエラー:', err);
      setError(err.response?.data?.message || 'ログインに失敗しました');
    }
  };

  if (loadingFacility) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>読み込み中...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>ログイン</h1>
      <h2>施設: {facilityName}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <div>
          <label>メールアドレス：</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード：</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
      </form>

      <div style={{ marginTop: '10px' }}>
        <p>
          アカウントをお持ちでない方は{' '}
          <a href={`/register?group_id=${group_id}&facility_id=${facility_id}`}>
            新規登録
          </a>
          <br />
          パスワードをお忘れの方は{' '}
          <a href={`/change-password?group_id=${group_id}&facility_id=${facility_id}`}>
            こちら
          </a>
        </p>
      </div>
    </div>
  );
}
