// frontend/pages/reservations/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import withAuth from '../../utils/withAuth';

type Reservation = {
  id: number;
  doctor_name: string;
  department_name: string;
  facility_name: string;
  date: string;
  time: string;
  visit_type: string;
  status: string;
  questionnaireEnabled: boolean;
};

function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [error, setError] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/reservations', { withCredentials: true });
      if (!Array.isArray(res.data)) {
        setReservations([]);
        setError(true);
        return;
      }

      const [doctorsRes, departmentsRes, facilitiesRes] = await Promise.all([
        axios.get('http://localhost:5000/doctors', { withCredentials: true }),
        axios.get('http://localhost:5000/departments', { withCredentials: true }),
        axios.get('http://localhost:5000/facilities', { withCredentials: true }),
      ]);

      const doctors = doctorsRes.data;
      const departments = departmentsRes.data;
      const facilities = facilitiesRes.data;

      const withNames = await Promise.all(res.data.map(async (rsv: any) => {
        let questionnaireEnabled = false;
        try {
          const checkRes = await axios.get(
            `http://localhost:5000/questionnaire-settings/check?group_id=1&facility_id=${rsv.facility_id}&department_id=${rsv.department_id}`,
            { withCredentials: true }
          );
          questionnaireEnabled = checkRes.data.enabled;
        } catch (err) {
          console.error('問診チェックエラー:', err);
        }

        return {
          id: rsv.id,
          doctor_name: doctors.find((d: any) => d.id === rsv.doctor_id)?.name || `ID:${rsv.doctor_id}`,
          department_name: departments.find((d: any) => d.id === rsv.department_id)?.name || `ID:${rsv.department_id}`,
          facility_name: facilities.find((f: any) => f.id === rsv.facility_id)?.name || `ID:${rsv.facility_id}`,
          date: rsv.date,
          time: rsv.time,
          visit_type: rsv.visit_type || '新患',
          status: rsv.status,
          questionnaireEnabled,
        };
      }));

      setReservations(withNames);
      setError(false);
    } catch (err) {
      console.error('予約取得エラー:', err);
      setReservations([]);
      setError(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この予約をキャンセルしてもよろしいですか？')) return;
    try {
      await axios.delete(`http://localhost:5000/reservations/${id}`, { withCredentials: true });
      alert('予約をキャンセルしました');
      fetchReservations();
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2>予約一覧</h2>
        <Link href="/reserve" passHref legacyBehavior>
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
              ＋ 新しく予約する
            </button>
          </a>
        </Link>
      </div>

      {reservations === null ? (
        <p>読み込み中...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>
          予約情報の取得に失敗しました。<br />
          通信エラーまたはログインセッションが切れている可能性があります。
        </p>
      ) : reservations.length === 0 ? (
        <p>現在、予約はありません。</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>医師</th>
              <th>診療科</th>
              <th>施設</th>
              <th>日付</th>
              <th>時間</th>
              <th>区分</th>
              <th>状態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((rsv) => (
              <tr key={rsv.id}>
                <td>{rsv.id}</td>
                <td>{rsv.doctor_name}</td>
                <td>{rsv.department_name}</td>
                <td>{rsv.facility_name}</td>
                <td>{rsv.date}</td>
                <td>{rsv.time}</td>
                <td>{rsv.visit_type}</td>
                <td>{rsv.status}</td>
                <td>
                  <Link href={`/reservations/edit/${rsv.id}`} passHref>
                    <button style={{ marginRight: '0.5rem' }}>編集</button>
                  </Link>
                  <button onClick={() => handleDelete(rsv.id)} style={{ marginRight: '0.5rem' }}>キャンセル</button>
                  {rsv.questionnaireEnabled && (
                    <Link href={`/questionnaire/${rsv.id}`} passHref>
                      <button>問診</button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withAuth(ReservationList);
