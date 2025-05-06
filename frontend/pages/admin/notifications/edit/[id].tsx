import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface NotificationSetting {
  id: number;
  facility_id: number;
  notify_email: boolean;
  notify_line: boolean;
  notify_sms: boolean;
}

export default function EditNotificationSettingPage() {
  const router = useRouter();
  const { id } = router.query;

  const [setting, setSetting] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchSetting = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/notifications/${id}`, {
          withCredentials: true,
        });
        setSetting(res.data);
      } catch (err) {
        console.error('取得エラー:', err);
        alert('通知設定の取得に失敗しました');
        router.push('/admin/notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, [id]);

  const handleChange = (key: keyof NotificationSetting) => {
    if (!setting) return;
    setSetting({ ...setting, [key]: !setting[key] });
  };

  const handleUpdate = async () => {
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

  if (loading || !setting) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">通知設定編集</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">通知設定編集</h1>

      <div className="mb-4">
        <label className="block mb-1">メール通知</label>
        <input
          type="checkbox"
          checked={setting.notify_email}
          onChange={() => handleChange('notify_email')}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">LINE通知</label>
        <input
          type="checkbox"
          checked={setting.notify_line}
          onChange={() => handleChange('notify_line')}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1">SMS通知</label>
        <input
          type="checkbox"
          checked={setting.notify_sms}
          onChange={() => handleChange('notify_sms')}
        />
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        更新する
      </button>
    </div>
  );
}
