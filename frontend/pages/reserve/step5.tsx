import { useRouter } from 'next/router';

export default function Step5Complete() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const handleGoToMyPage = () => {
    router.push(`/mypage?group_id=${group_id}&facility_id=${facility_id}`);
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-6">予約完了</h1>
      <p className="text-lg mb-6">ご予約ありがとうございます。予約が正常に完了しました。</p>
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        onClick={handleGoToMyPage}
      >
        マイページへ戻る
      </button>
    </div>
  );
}
