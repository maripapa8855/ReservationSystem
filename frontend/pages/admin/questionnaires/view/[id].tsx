// frontend/pages/admin/questionnaires/view/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../../../utils/withAuth';

function AdminQuestionnaireView() {
  const router = useRouter();
  const { id } = router.query;

  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchQuestionnaire = async () => {
    if (!id) return;

    try {
      const res = await axios.get(`http://localhost:5000/admin/questionnaires/${id}`, {
        withCredentials: true,
      });
      setQuestionnaire(res.data);
    } catch (err) {
      console.error('問診詳細取得エラー:', err);
      setError('問診情報の取得に失敗しました。');
    }
  };

  useEffect(() => {
    fetchQuestionnaire();
  }, [id]);

  if (!questionnaire && !error) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診詳細</h2>

      <p><strong>患者名:</strong> {questionnaire.user_name}</p>
      <p><strong>施設:</strong> {questionnaire.facility_name}</p>
      <p><strong>診療科:</strong> {questionnaire.department_name}</p>

      <h3>回答内容</h3>
      {Array.isArray(questionnaire.answers) ? (
        <ul>
          {questionnaire.answers.map((ans: any, idx: number) => (
            <li key={idx}>
              <strong>{ans.question}</strong><br />
              {ans.answer}
            </li>
          ))}
        </ul>
      ) : (
        <p>回答データが不正です。</p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => router.push('/admin/questionnaires')}>一覧へ戻る</button>
      </div>
    </div>
  );
}

export default withAuth(AdminQuestionnaireView);
