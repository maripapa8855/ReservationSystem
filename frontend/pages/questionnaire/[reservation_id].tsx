// frontend/pages/questionnaire/[reservation_id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../utils/withAuth';

function QuestionnairePage() {
  const router = useRouter();
  const { reservation_id } = router.query;

  const [template, setTemplate] = useState<{ key: string; label: string }[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noTemplate, setNoTemplate] = useState(false);

  useEffect(() => {
    if (!reservation_id) return;
    fetchTemplateAndAnswers();
  }, [reservation_id]);

  const fetchTemplateAndAnswers = async () => {
    try {
      // 予約情報取得
      const rsvRes = await axios.get('http://localhost:5000/reservations', { withCredentials: true });
      const reservation = rsvRes.data.find((r: any) => r.id.toString() === reservation_id);

      if (!reservation) {
        setError('予約が見つかりません');
        setLoading(false);
        return;
      }

      const { group_id, facility_id, department_id } = reservation;

      // テンプレート取得
      const tmplRes = await axios.get(`http://localhost:5000/questionnaire-templates/check-template?group_id=${group_id}&facility_id=${facility_id}&department_id=${department_id}`, {
        withCredentials: true,
      });

      if (tmplRes.data?.template_content?.length) {
        setTemplate(tmplRes.data.template_content);
      } else {
        setNoTemplate(true);
      }

      // 既存の回答取得（あれば）
      try {
        const ansRes = await axios.get(`http://localhost:5000/questionnaires/${reservation_id}`, {
          withCredentials: true,
        });
        if (ansRes.data?.answers) {
          setAnswers(ansRes.data.answers);
        }
      } catch (err) {
        console.log('問診回答なし（新規入力）');
      }
    } catch (err: any) {
      console.error('問診テンプレート取得エラー:', err.message || err);
      setError('問診テンプレート取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation_id) return;

    try {
      await axios.post('http://localhost:5000/questionnaires', {
        reservation_id,
        answers,
      }, { withCredentials: true });

      alert('問診を保存しました');
      router.push('/reservations');
    } catch (err) {
      console.error('問診保存エラー:', err);
      setError('問診保存に失敗しました');
    }
  };

  if (loading) return <p>読み込み中...</p>;

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (noTemplate) return (
    <div style={{ padding: '2rem' }}>
      <h2>問診票</h2>
      <p>この診療科では問診票は設定されていません。</p>
      <button onClick={() => router.push('/reservations')}>予約一覧に戻る</button>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診票</h2>
      <form onSubmit={handleSubmit}>
        {template.map((q, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <label>{q.label}</label><br />
            <input
              type="text"
              value={answers[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        ))}
        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit">保存する</button>
          <button
            type="button"
            onClick={() => router.push('/reservations')}
            style={{ marginLeft: '1rem' }}
          >
            戻る
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(QuestionnairePage);
