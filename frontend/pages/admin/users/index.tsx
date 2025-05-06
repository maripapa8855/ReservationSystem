import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  group_id: number;
  facility_id?: number;
}

interface Group {
  id: number;
  name: string;
}

interface Facility {
  id: number;
  name: string;
  group_id: number;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [role, setRole] = useState<string>('');
  const [myRole, setMyRole] = useState<string>('');
  const [myGroupId, setMyGroupId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/me', {
          withCredentials: true,
        });
        setMyRole(res.data.role);
        setMyGroupId(res.data.group_id);
        if (res.data.role !== 'super_admin') {
          setSelectedGroup(res.data.group_id); // グループ管理者は自身のグループに固定
        }
      } catch (err) {
        console.error('現在のユーザー取得エラー:', err);
      }
    };

    const fetchInitialData = async () => {
      try {
        const [groupRes, facilityRes] = await Promise.all([
          axios.get('http://localhost:5000/groups', { withCredentials: true }),
          axios.get('http://localhost:5000/facilities', { withCredentials: true }),
        ]);
        setGroups(groupRes.data);
        setFacilities(facilityRes.data);
      } catch (err) {
        console.error('グループ・施設取得エラー:', err);
      }
    };

    fetchCurrentUser();
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let url = 'http://localhost:5000/users?';
        if (selectedGroup) url += `group_id=${selectedGroup}&`;
        if (selectedFacility) url += `facility_id=${selectedFacility}&`;
        if (role) url += `role=${role}&`;

        const res = await axios.get(url, { withCredentials: true });
        setUsers(res.data);
      } catch (err) {
        console.error('ユーザー取得エラー:', err);
      }
    };

    fetchUsers();
  }, [selectedGroup, selectedFacility, role]);

  const filteredFacilities = selectedGroup
    ? facilities.filter((f) => f.group_id === selectedGroup)
    : facilities;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* グループ選択（super_adminのみ） */}
        {myRole === 'super_admin' && (
          <div>
            <label className="block font-semibold mb-1">グループ選択</label>
            <select
              className="border px-3 py-2 rounded w-full"
              value={selectedGroup ?? ''}
              onChange={(e) => {
                setSelectedGroup(e.target.value ? Number(e.target.value) : null);
                setSelectedFacility(null);
              }}
            >
              <option value="">すべて</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 施設選択 */}
        <div>
          <label className="block font-semibold mb-1">施設選択</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={selectedFacility ?? ''}
            onChange={(e) =>
              setSelectedFacility(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">すべて</option>
            {filteredFacilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* ロール選択 */}
        <div>
          <label className="block font-semibold mb-1">権限</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">すべて</option>
            <option value="super_admin">統括管理者</option>
            <option value="group_admin">施設グループ管理者</option>
            <option value="admin">施設管理者</option>
            <option value="viewer">閲覧専用</option>
            <option value="user">一般ユーザー</option>
          </select>
        </div>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">名前</th>
            <th className="border px-4 py-2">メール</th>
            <th className="border px-4 py-2">権限</th>
            <th className="border px-4 py-2">グループID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.group_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
