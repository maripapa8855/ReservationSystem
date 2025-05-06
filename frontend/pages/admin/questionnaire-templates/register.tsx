// frontend/pages/admin/questionnaire-templates/register.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '../../../utils/withAuth';

function RegisterQuestionnaireTemplate() {
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [questions, setQuestions] = useState<string[]>(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

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

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleChangeQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedGroup || !selectedFacility || !selectedDepartment || questions.some(q => q.trim() === '')) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      await axios.post('http://localhost:5000/questionnaire-templates', {
        group_id: Number(selectedGroup),
        facility_id: Number(selectedFacility),
        department_id: Number(selectedDepartment),
        template_content: questions.map(q => ({ question: q })),
      }, { withCredentials: true });

      alert('テンプレートを登録しました');
      router.push('/admin/questionnaire-templates');
    } catch (err) {
      console.error('登録エラー:', err);
      setError('登録に失敗しました');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>問診テンプレート新規登録</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>グループ:</label>
          <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="">選択してください</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>施設:</label>
          <select value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)}>
            <option value="">選択してください</option>
            {facilities.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>診療科:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">選択してください</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>質問項目:</label>
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={q}
                onChange={(e) => handleChangeQuestion(idx, e.target.value)}
                style={{ width: '80%' }}
              />
              <button type="button" onClick={() => handleDeleteQuestion(idx)} style={{ marginLeft: '0.5rem' }}>
                削除
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddQuestion} style={{ marginTop: '0.5rem' }}>
            ＋ 質問追加
          </button>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit">登録する</button>
          <button type="button" onClick={() => router.push('/admin/questionnaire-templates')} style={{ marginLeft: '1rem' }}>
            戻る
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(RegisterQuestionnaireTemplate);
