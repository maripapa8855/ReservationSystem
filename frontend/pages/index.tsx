import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

export default function HomePage() {
  const router = useRouter();
  const { userId, name, email, groupId, facilityId, role, loading } = useUser();
  const [reservations, setReservations] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      alert("認証情報が不足しています。ログインし直してください。");
      router.push("/login");
    } else {
      fetchReservations();
    }
  }, [loading, userId]);

  const fetchReservations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/reservations", {
        withCredentials: true,
      });
      setReservations(res.data);
    } catch (err) {
      console.error("予約一覧取得エラー:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleReserveClick = () => {
    console.log("🔍 push前 group_id:", groupId, "facility_id:", facilityId);
    if (groupId && facilityId) {
      router.push({
        pathname: "/reserve/step2",
        query: { group_id: groupId.toString(), facility_id: facilityId.toString() },
      });
    } else {
      alert("group_id または facility_id が取得できていません。ログインし直してください。");
    }
  };

  if (loading || fetching) return <p className="p-6">読み込み中...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">病院予約システム トップページ</h1>
      <p className="mb-4">
        ようこそ、{name} さん（メール: {email}、役割: {role}）！
      </p>

      {role === "user" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">あなたの予約一覧</h2>
          {reservations.length === 0 ? (
            <p>予約はありません。</p>
          ) : (
            <ul className="list-disc pl-5">
              {reservations.map((r) => (
                <li key={r.id}>
                  {r.date} {r.time} - {r.doctor_name}（{r.department_name}）
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleReserveClick}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            新規予約をする
          </button>
        </div>
      )}

      {role === "facilityadmin" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">施設管理者メニュー</h2>
          <button
            onClick={() =>
              router.push({
                pathname: "/admin/facilities",
                query: { group_id: groupId, facility_id: facilityId },
              })
            }
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            施設管理画面へ
          </button>
        </div>
      )}

      {role === "superadmin" && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">統括管理者メニュー</h2>
          <button
            onClick={() =>
              router.push({
                pathname: "/admin",
                query: { group_id: groupId, facility_id: facilityId },
              })
            }
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            管理者ダッシュボードへ
          </button>
        </div>
      )}
    </div>
  );
}
