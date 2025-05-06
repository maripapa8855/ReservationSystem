import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Facility {
  id: number;
  name: string;
}

interface NotificationSetting {
  id: number;
  facility_id: number;
  notify_email: boolean;
  notify_line: boolean;
  notify_sms: boolean;
}

export default function NotificationSettingsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/facilities/by-admin', { withCredentials: true });
        setFacilities(res.data);
        if (res.data.length > 0) {
          setSelectedFacilityId(res.data[0].id);
        }
      } catch (err) {
        console.error('施設取得エラー:', err);
      }
    };
    fetchFacilities();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!selectedFacilityId) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/notifications?facility_id=${selectedFacilityId}`, {
          withCredentials: true,
        });
        setSettings(res.data);
      } catch (err) {
        console.error('通知設定取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [selectedFacilityId]);

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFacilityId(Number(e.target.value));
  };

  const handleToggle = (id: number, field: keyof NotificationSetting) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s))
    );
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        settings.map((setting) =>
          axios.put(`http://localhost:5000/notifications/${setting.id}`, setting, {
            withCredentials: true,
          })
        )
      );
      alert('通知設定を保存しました');
    } catch (err) {
      console.error('通知設定保存エラー:', err);
      alert('保存に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">通知設定</h1>

      {/* 施設選択 */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">施設を選択</label>
        <select
          value={selectedFacilityId ?? ''}
          onChange={handleFacilityChange}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">施設を選んでください</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* 設定表示 */}
      {loading ? (
        <p>読み込み中...</p>
      ) : settings.length === 0 ? (
        <p>通知設定が見つかりません。</p>
      ) : (
        <>
          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">メール</th>
                <th className="border px-4 py-2">LINE</th>
                <th className="border px-4 py-2">SMS</th>
                <th className="border px-4 py-2">編集</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id}>
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={s.notify_email}
                      onChange={() => handleToggle(s.id, 'notify_email')}
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={s.notify_line}
                      onChange={() => handleToggle(s.id, 'notify_line')}
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={s.notify_sms}
                      onChange={() => handleToggle(s.id, 'notify_sms')}
                    />
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Link
                      href={`/admin/notifications/edit/${s.id}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-right">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </>
      )}
    </div>
  );
}
