// components/AdminLayout.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

type Props = {
  children: React.ReactNode;
};

const AdminLayout = ({ children }: Props) => {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/profile', {
          withCredentials: true,
        });
        setAdminName(res.data.name); // 管理者の名前
      } catch (err) {
        console.warn('認証されていないためリダイレクトします');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [router]);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h2>管理者: {adminName ?? '---'}</h2>
        <hr />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
