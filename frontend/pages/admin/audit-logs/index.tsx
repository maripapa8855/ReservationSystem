import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

type LogEntry = {
  id: number;
  user_id: number;
  user_name?: string;
  action: string;
  entity: string;
  entity_id: number | null;
  detail: any;
  timestamp: string;
};

export default function AuditLogList() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  const [userId, setUserId] = useState("");
  const [entity, setEntity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then((res) => {
        if (res.data.role !== "super_admin") {
          alert("アクセス権限がありません");
          router.push("/admin");
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => router.push("/admin/login"));
  }, []);

  const fetchLogs = () => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (entity) params.append("entity", entity);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    axios
      .get(`http://localhost:5000/audit-logs?${params.toString()}`, {
        withCredentials: true,
      })
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("ログ取得エラー:", err));
  };

  useEffect(() => {
    if (authChecked) fetchLogs();
  }, [authChecked]);

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">監査ログ一覧</h1>

      <button
        onClick={() => window.open("http://localhost:5000/audit-logs/csv", "_blank")}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        CSVダウンロード
      </button>

      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="ユーザーID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="エンティティ名（例：facility）"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={fetchLogs}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          フィルター適用
        </button>
      </div>

      <table className="w-full border table-auto text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">ユーザー</th>
            <th className="border px-2 py-1">操作</th>
            <th className="border px-2 py-1">対象</th>
            <th className="border px-2 py-1">対象ID</th>
            <th className="border px-2 py-1">詳細</th>
            <th className="border px-2 py-1">日時</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="border px-2 py-1">{log.id}</td>
              <td className="border px-2 py-1">
                {log.user_id}（{log.user_name ?? "不明"}）
              </td>
              <td className="border px-2 py-1">{log.action}</td>
              <td className="border px-2 py-1">{log.entity}</td>
              <td className="border px-2 py-1">{log.entity_id ?? "-"}</td>
              <td className="border px-2 py-1 whitespace-pre-wrap">
                <pre className="text-xs">{JSON.stringify(log.detail, null, 2)}</pre>
              </td>
              <td className="border px-2 py-1">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
