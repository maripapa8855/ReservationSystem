import { useRouter } from 'next/router';

export default function Confirm() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const handleGoToMyPage = () => {
    router.push({
      pathname: '/mypage',
      query: { group_id, facility_id },
    });
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>✅ ご予約ありがとうございました！</h1>
      <p>確認メールをお送りしました。</p>

      <button
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }}
        onClick={handleGoToMyPage}
      >
        マイページへ戻る
      </button>
    </div>
  );
}
