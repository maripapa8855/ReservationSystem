import { useEffect, useState } from 'react';
import axios from 'axios';

interface Facility {
  id: number;
  name: string;
}

interface StatEntry {
  department_name: string;
  reservation_count: number;
}

export default function StatsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<StatEntry[]>([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/facilities/by-admin', { withCredentials: true })
      .then((res) => {
        setFacilities(res.data);
        if (res.data.length > 0) setSelectedFacilityId(res.data[0].id);
      })
      .catch((err) => console.error('施設取得エラー:', err));
  }, []);

  const fetchStats = async () => {
    if (!selectedFacilityId || !startDate || !endDate) {
      alert('施設と日付範囲を選択してください');
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/stats/reservations?facility_id=${selectedFacilityId}&start=${startDate}&end=${endDate}`,
        { withCredentials: true }
      );
      setStats(res.data);
    } catch (err) {
      console.error('統計取得エラー:', err);
      alert('統計の取得に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">予約統計</h1>

      <div className="mb-4">
        <label className="block mb-1">施設選択</label>
        <select
          className="border px-3 py-2 rounded w-full"
          value={selectedFacilityId ?? ''}
          onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
        >
          <option value="">選択してください</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block mb-1">開始日</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">終了日</label>
          <input
            type="date"
            className="border px-3 py-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={fetchStats}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mb-6"
      >
        統計を取得
      </button>

      {stats.length > 0 && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">診療科</th>
              <th className="border px-4 py-2">予約数</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{s.department_name}</td>
                <td className="border px-4 py-2">{s.reservation_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
