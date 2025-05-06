// frontend/pages/admin/questionnaires/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import withAuth from '../../../utils/withAuth';

type Questionnaire = {
  id: number;
  reservation_id: number;
  user_name: string;
  facility_name: string;
  department_name: string;
};

function AdminQuestionnaireList() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [error, setError] = useState(false);

  const fetchQuestionnaires = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/questionnaires', { withCredentials: true });
      setQuestionnaires(res.data);
    } catch (err) {
      console.error('問診一覧取得エラー:', err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診一覧</h2>

      {error ? (
        <p style={{ color: 'red' }}>問診情報の取得に失敗しました。</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>患者名</th>
              <th>施設</th>
              <th>診療科</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.user_name}</td>
                <td>{q.facility_name}</td>
                <td>{q.department_name}</td>
                <td>
                  <Link href={`/admin/questionnaires/view/${q.id}`} passHref>
                    <button>詳細</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withAuth(AdminQuestionnaireList);
