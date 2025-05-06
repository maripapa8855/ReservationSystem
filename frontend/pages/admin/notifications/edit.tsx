import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

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

export default function EditNotificationSettingsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [setting, setSetting] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    const fetchSetting = async () => {
      if (!selectedFacilityId) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/notifications?facility_id=${selectedFacilityId}`, {
          withCredentials: true,
        });
        setSetting(res.data[0]); // 配列の1件目を使用（施設ごとに1設定前提）
      } catch (err) {
        console.error('通知設定取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, [selectedFacilityId]);

  const handleChange = (field: keyof NotificationSetting) => {
    if (setting) {
      setSetting({ ...setting, [field]: !setting[field] });
    }
  };

  const handleSave = async () => {
    if (!setting) return;
    try {
      await axios.put(`http://localhost:5000/notifications/${setting.id}`, setting, {
        withCredentials: true,
      });
      alert('通知設定を更新しました');
      router.push('/admin/notifications');
    } catch (err) {
      console.error('更新エラー:', err);
      alert('更新に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">通知設定編集</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">施設を選択</label>
        <select
          value={selectedFacilityId ?? ''}
          onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
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

      {loading ? (
        <p>読み込み中...</p>
      ) : setting ? (
        <div className="space-y-4">
          <label className="block">
            <input
              type="checkbox"
              checked={setting.notify_email}
              onChange={() => handleChange('notify_email')}
              className="mr-2"
            />
            メール通知
          </label>

          <label className="block">
            <input
              type="checkbox"
              checked={setting.notify_line}
              onChange={() => handleChange('notify_line')}
              className="mr-2"
            />
            LINE通知
          </label>

          <label className="block">
            <input
              type="checkbox"
              checked={setting.notify_sms}
              onChange={() => handleChange('notify_sms')}
              className="mr-2"
            />
            SMS通知
          </label>

          <button
            onClick={handleSave}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            保存する
          </button>
        </div>
      ) : (
        <p>通知設定が見つかりません。</p>
      )}
    </div>
  );
}
