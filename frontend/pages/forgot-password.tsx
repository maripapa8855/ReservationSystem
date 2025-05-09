import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Facility {
  id: number;
  name: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { group_id, facility_id } = router.query;

  const [email, setEmail] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!group_id) return;

    axios
      .get('http://localhost:5000/facilities', {
        params: { group_id },
      })
      .then((res) => {
        setFacilities(res.data);

        // クエリにfacility_idがあれば初期選択
        if (facility_id && res.data.some((f: Facility) => f.id.toString() === facility_id)) {
          setSelectedFacilityId(facility_id as string);
        }
      })
      .catch((err) => {
        console.error('施設取得エラー:', err);
        setError('施設情報の取得に失敗しました');
      });
  }, [group_id, facility_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedFacilityId) {
      setError('施設を選択してください');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/auth/forgot-password',
        {
          email,
          facility_id: selectedFacilityId,
          group_id,
        },
        { withCredentials: true }
      );

      setMessage(res.data.message || 'パスワードリセット用のメールを送信しました。');
      
      // 成功したら数秒後にログイン画面へ遷移（任意）
      setTimeout(() => {
        router.push(`/login?group_id=${group_id}&facility_id=${selectedFacilityId}`);
      }, 3000);
    } catch (err: any) {
      console.error('送信エラー:', err);
      setError('メール送信に失敗しました。メールアドレスと施設をご確認ください。');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">パスワードをお忘れですか？</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">登録済みのメールアドレス</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">施設を選択</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            required
          >
            <option value="">-- 施設を選んでください --</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          メールを送信
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
