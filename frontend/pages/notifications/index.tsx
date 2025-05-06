import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationSettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyLine, setNotifyLine] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初期設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/notifications', {
          withCredentials: true,
        });
        setNotifyEmail(res.data.notify_email);
        setNotifyLine(res.data.notify_line);
        setLoading(false);
      } catch (err) {
        console.error('通知設定取得エラー:', err);
        alert('通知設定の取得に失敗しました');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(
        'http://localhost:5000/notifications',
        {
          notify_email: notifyEmail,
          notify_line: notifyLine,
        },
        { withCredentials: true }
      );
      alert('通知設定を保存しました');
    } catch (err) {
      console.error('保存エラー:', err);
      alert('通知設定の保存に失敗しました');
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>通知設定</h2>
      <div>
        <label>
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.checked)}
          />
          メール通知を受け取る
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={notifyLine}
            onChange={(e) => setNotifyLine(e.target.checked)}
          />
          LINE通知を受け取る（将来対応）
        </label>
      </div>
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
