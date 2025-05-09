import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:5000/auth/check', { withCredentials: true });
        setIsLoggedIn(true);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const buildQuery = () => {
    return group_id && facility_id ? `?group_id=${group_id}&facility_id=${facility_id}` : '';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>病院予約システム</h1>
      <ul>
        {!isLoggedIn ? (
          <>
            <li><Link href={`/register${buildQuery()}`}>▶ 新規登録</Link></li>
            <li><Link href={`/login${buildQuery()}`}>▶ ログイン</Link></li>
            <li><Link href={`/change-password${buildQuery()}`}>▶ パスワード変更</Link></li>
          </>
        ) : (
          <>
            <li><Link href={`/reserve/step2${buildQuery()}`}>▶ 予約する</Link></li>
            <li><Link href={`/reservations${buildQuery()}`}>▶ 予約一覧を見る</Link></li>
          </>
        )}
      </ul>
    </div>
  );
}
