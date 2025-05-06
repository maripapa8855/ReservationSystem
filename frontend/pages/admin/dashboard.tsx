// frontend/pages/admin/dashboard.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/profile', {
          withCredentials: true,
        });
        setAdminName(res.data.name);
      } catch (err) {
        console.error('管理者情報取得エラー:', err);
        setError('認証されていない、またはセッション切れです。');
        router.push('/admin/login');
      }
    };

    fetchAdminInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/admin/logout', {}, { withCredentials: true });
      router.push('/admin/login');
    } catch (err) {
      console.error('ログアウト失敗:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>管理者ダッシュボード</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <p>ようこそ、{adminName} さん</p>
          <ul>
            <li><Link href="/admin/doctors">👨‍⚕️ 医師管理</Link></li>
            <li><Link href="/admin/departments">🏥 診療科管理</Link></li>
            <li><Link href="/admin/facilities">🏢 施設管理</Link></li>
          </ul>
          <button onClick={handleLogout}>ログアウト</button>
        </>
      )}
    </div>
  );
}
