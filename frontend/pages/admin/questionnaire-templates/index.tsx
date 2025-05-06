import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import withAuth from '../../../utils/withAuth';

type Template = {
  id: number;
  group_name: string;
  facility_name: string;
  department_name: string;
  template_content: { question: string }[]; // より正確な型定義
};

function QuestionnaireTemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:5000/questionnaire-templates', {
        withCredentials: true,
      });
      setTemplates(res.data);
    } catch (err) {
      console.error('テンプレート取得エラー:', err);
      setError(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このテンプレートを削除してもよろしいですか？')) return;
    try {
      await axios.delete(`http://localhost:5000/questionnaire-templates/${id}`, {
        withCredentials: true,
      });
      alert('テンプレートを削除しました');
      fetchTemplates();
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診テンプレート管理</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/questionnaire-templates/register" passHref legacyBehavior>
          <a>
            <button style={{
              padding: '0.5rem 1.2rem',
              fontSize: '1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              ＋ 新規登録
            </button>
          </a>
        </Link>
      </div>

      {error ? (
        <p style={{ color: 'red' }}>テンプレート情報の取得に失敗しました。</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>グループ</th>
              <th>施設</th>
              <th>診療科</th>
              <th>質問項目</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id}>
                <td>{tpl.id}</td>
                <td>{tpl.group_name}</td>
                <td>{tpl.facility_name}</td>
                <td>{tpl.department_name}</td>
                <td>
                  {tpl.template_content && tpl.template_content.length > 0
                    ? tpl.template_content.map((q, idx) => (
                        <div key={idx}>{q.question}</div>
                      ))
                    : '-'}
                </td>
                <td>
                  <Link href={`/admin/questionnaire-templates/edit/${tpl.id}`} passHref>
                    <button style={{ marginRight: '0.5rem' }}>編集</button>
                  </Link>
                  <button onClick={() => handleDelete(tpl.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withAuth(QuestionnaireTemplateList);
