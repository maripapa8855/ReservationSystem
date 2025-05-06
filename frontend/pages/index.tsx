import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Cookieベース認証ではここでサーバーにログイン確認リクエストを送るのが理想だが、
    // 今は簡易的に localStorage を fallback 的に使用
    const userId = localStorage.getItem('user_id');
    setIsLoggedIn(!!userId);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>病院予約システム</h1>
      <ul>
        {!isLoggedIn && (
          <>
            <li><Link href="/register">▶ 新規登録</Link></li>
            <li><Link href="/login">▶ ログイン</Link></li>
            <li><Link href="/change-password">▶ パスワード変更</Link></li>
          </>
        )}
        {isLoggedIn && (
          <>
            <li><Link href="/reserve/step2">▶ 予約する</Link></li>
            <li><Link href="/reservations">▶ 予約一覧を見る</Link></li>
          </>
        )}
       
      </ul>
    </div>
  );
}
