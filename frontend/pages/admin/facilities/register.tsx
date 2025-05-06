import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const RegisterFacility = () => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);

  // 予約制限用
  const [maxReservationDays, setMaxReservationDays] = useState(30);
  const [minHoursBeforeReservation, setMinHoursBeforeReservation] = useState(1);
  const [minHoursBeforeCancel, setMinHoursBeforeCancel] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:5000/groups', { withCredentials: true });
        setGroups(res.data);
      } catch (err) {
        console.error('グループ取得エラー:', err);
        alert('グループの取得に失敗しました');
      }
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/facilities', {
        name,
        group_id: groupId,
        max_reservation_days: maxReservationDays,
        min_hours_before_reservation: minHoursBeforeReservation,
        min_hours_before_cancel: minHoursBeforeCancel,
      }, { withCredentials: true });

      alert('施設を登録しました');
      router.push('/admin/facilities');
    } catch (err) {
      console.error('登録エラー:', err);
      alert('施設の登録に失敗しました');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">施設登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">施設名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">所属グループ</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">選択してください</option>
            {groups.map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* 予約制限設定 */}
        <div>
          <label className="block mb-1">何日先まで予約可能か</label>
          <input
            type="number"
            value={maxReservationDays}
            onChange={(e) => setMaxReservationDays(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            min={1}
            required
          />
        </div>

        <div>
          <label className="block mb-1">何時間前まで予約受付可能か</label>
          <input
            type="number"
            value={minHoursBeforeReservation}
            onChange={(e) => setMinHoursBeforeReservation(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            min={0}
            required
          />
        </div>

        <div>
          <label className="block mb-1">何時間前までキャンセル可能か</label>
          <input
            type="number"
            value={minHoursBeforeCancel}
            onChange={(e) => setMinHoursBeforeCancel(Number(e.target.value))}
            className="border px-3 py-2 rounded w-full"
            min={0}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default RegisterFacility;
