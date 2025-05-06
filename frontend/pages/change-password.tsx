import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'http://localhost:5000/change-password',
        { oldPassword, newPassword },
        { withCredentials: true }
      );

      setMessage(res.data.message);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'エラーが発生しました');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔒 パスワード変更</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>現在のパスワード：</label><br />
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        </div>
        <div>
          <label>新しいパスワード：</label><br />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit">変更する</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
