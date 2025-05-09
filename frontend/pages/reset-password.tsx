import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, group_id, facility_id } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [facilityName, setFacilityName] = useState('');

  useEffect(() => {
    if (!token) {
      setError('無効なリンクです。トークンがありません');
    }

    // 施設名取得（facility_id があれば）
    if (facility_id && group_id) {
      axios
        .get(`http://localhost:5000/facilities/${facility_id}?group_id=${group_id}`)
        .then((res) => setFacilityName(res.data.name))
        .catch((err) => {
          console.error('施設情報取得エラー:', err);
          setFacilityName('(取得失敗)');
        });
    }
  }, [token, facility_id, group_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/reset-password', {
        token,
        newPassword,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        router.push(`/login?group_id=${group_id}&facility_id=${facility_id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'エラーが発生しました');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>パスワードリセット</h2>

      {facility_id && (
        <p>
          <strong>施設:</strong> {facilityName || '(取得中...)'}
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>新しいパスワード:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>確認用パスワード:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">送信</button>
      </form>
    </div>
  );
}
