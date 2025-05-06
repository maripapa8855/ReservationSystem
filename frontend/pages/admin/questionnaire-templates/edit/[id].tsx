// frontend/pages/admin/questionnaire-templates/edit/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../../../utils/withAuth';

function EditQuestionnaireTemplate() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    group_id: '',
    facility_id: '',
    department_id: '',
    template_content: [{ question: '' }],
  });
  const [groups, setGroups] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOptions();
    fetchTemplate();
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [groupRes, facilityRes, departmentRes] = await Promise.all([
        axios.get('http://localhost:5000/groups', { withCredentials: true }),
        axios.get('http://localhost:5000/facilities', { withCredentials: true }),
        axios.get('http://localhost:5000/departments', { withCredentials: true }),
      ]);
      setGroups(groupRes.data);
      setFacilities(facilityRes.data);
      setDepartments(departmentRes.data);
    } catch (err) {
      console.error('選択肢取得エラー:', err);
    }
  };

  const fetchTemplate = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/questionnaire-templates/${id}`, { withCredentials: true });
      setFormData({
        group_id: res.data.group_id,
        facility_id: res.data.facility_id,
        department_id: res.data.department_id,
        template_content: res.data.template_content || [{ question: '' }],
      });
    } catch (err) {
      console.error('テンプレート取得エラー:', err);
      setError('テンプレート情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...formData.template_content];
    updated[index].question = value;
    setFormData(prev => ({ ...prev, template_content: updated }));
  };

  const handleAddQuestion = () => {
    setFormData(prev => ({ ...prev, template_content: [...prev.template_content, { question: '' }] }));
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = formData.template_content.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, template_content: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.group_id || !formData.facility_id || !formData.department_id || formData.template_content.some(q => !q.question.trim())) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/questionnaire-templates/${id}`, {
        template_content: formData.template_content,
      }, { withCredentials: true });

      alert('テンプレートを更新しました');
      router.push('/admin/questionnaire-templates');
    } catch (err) {
      console.error('更新エラー:', err);
      setError('更新に失敗しました');
    }
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診テンプレート編集</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>グループ:</label>
          <select name="group_id" value={formData.group_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>施設:</label>
          <select name="facility_id" value={formData.facility_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {facilities.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>診療科:</label>
          <select name="department_id" value={formData.department_id} onChange={handleChange}>
            <option value="">選択してください</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>質問項目:</label>
          {formData.template_content.map((q, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                style={{ width: '80%' }}
              />
              <button type="button" onClick={() => handleDeleteQuestion(idx)} style={{ marginLeft: '0.5rem' }}>削除</button>
            </div>
          ))}
          <button type="button" onClick={handleAddQuestion} style={{ marginTop: '0.5rem' }}>
            ＋ 質問追加
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit">保存する</button>
          <button type="button" onClick={() => router.push('/admin/questionnaire-templates')} style={{ marginLeft: '1rem' }}>
            戻る
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EditQuestionnaireTemplate);
