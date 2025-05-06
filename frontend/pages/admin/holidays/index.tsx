import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Holiday {
  id: number;
  closed_date: string;
  note: string;
  facility_name: string;
  department_name: string;
}

export default function HolidayList() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const [facRes, userRes] = await Promise.all([
          axios.get('http://localhost:5000/facilities/by-admin', {
            withCredentials: true,
          }),
          axios.get('http://localhost:5000/auth/me', {
            withCredentials: true,
          }),
        ]);
        setFacilities(facRes.data);
        if (facRes.data.length === 1) {
          setSelectedFacility(facRes.data[0].id);
        }
        setRole(userRes.data.role);
      } catch (err) {
        console.error('取得エラー:', err);
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility === null) return;

    const fetchHolidays = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/holidays?facility_id=${selectedFacility}`,
          { withCredentials: true }
        );
        setHolidays(res.data);
      } catch (err) {
        console.error('休診日取得エラー:', err);
      }
    };

    fetchHolidays();
  }, [selectedFacility]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">休診日一覧</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">施設を選択：</label>
        <select
          value={selectedFacility ?? ''}
          onChange={(e) => setSelectedFacility(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          <option value="">-- 選択してください --</option>
          {facilities.map((fac: any) => (
            <option key={fac.id} value={fac.id}>
              {fac.name}
            </option>
          ))}
        </select>
      </div>

      {holidays.length === 0 ? (
        <p>表示できる休診日はありません。</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">日付</th>
              <th className="border px-4 py-2">理由</th>
              <th className="border px-4 py-2">施設名</th>
              <th className="border px-4 py-2">診療科名</th>
              {role !== 'viewer' && <th className="border px-4 py-2">操作</th>}
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td className="border px-4 py-2">{h.closed_date}</td>
                <td className="border px-4 py-2">{h.note}</td>
                <td className="border px-4 py-2">{h.facility_name}</td>
                <td className="border px-4 py-2">{h.department_name}</td>
                {role !== 'viewer' && (
                  <td className="border px-4 py-2">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={async () => {
                        if (!confirm('この休診日を削除しますか？')) return;
                        try {
                          await axios.delete(`http://localhost:5000/holidays/${h.id}`, {
                            withCredentials: true,
                          });
                          setHolidays((prev) => prev.filter((x) => x.id !== h.id));
                        } catch (err) {
                          alert('削除に失敗しました');
                        }
                      }}
                    >
                      削除
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {role !== 'viewer' && (
        <div className="mt-6">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.push('/admin/holidays/register')}
          >
            新しく休診日を追加する
          </button>
        </div>
      )}
    </div>
  );
}
