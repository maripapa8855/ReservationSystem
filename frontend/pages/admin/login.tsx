import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

export default function AdminMenu() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then((res) => {
        setRole(res.data.role);
        setAuthChecked(true);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, []);

  if (!authChecked) return <p className="p-4">認証確認中...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">管理者メニュー</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/admin/facilities" className="text-blue-600 underline">
            🏥 施設管理
          </Link>
        </li>
        <li>
          <Link href="/admin/doctors" className="text-blue-600 underline">
            👨‍⚕️ 医師管理
          </Link>
        </li>
        <li>
          <Link href="/admin/departments" className="text-blue-600 underline">
            🏷 診療科管理
          </Link>
        </li>
        <li>
          <Link href="/admin/group" className="text-blue-600 underline">
            🏢 施設グループ管理
          </Link>
        </li>
        <li>
          <Link href="/admin/holidays" className="text-blue-600 underline">
            📅 休診日管理
          </Link>
        </li>
        <li>
          <Link href="/admin/notifications" className="text-blue-600 underline">
            🔔 通知設定
          </Link>
        </li>
        {role === "super_admin" && (
          <>
            <li>
              <Link href="/admin/admins" className="text-blue-600 underline">
                👥 管理者一覧
              </Link>
            </li>
            <li>
              <Link href="/admin/admins/register" className="text-blue-600 underline">
                👤 管理者の追加登録
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
