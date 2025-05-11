import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Step5Complete() {
  const router = useRouter();
  const { group_id, facility_id, department_id, doctor_id } = router.query;

  const [facilityName, setFacilityName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    if (facility_id) {
      axios.get(`http://localhost:5000/facilities/${facility_id}`)
        .then((res) => setFacilityName(res.data.name))
        .catch(() => setFacilityName('(取得失敗)'));
    }

    if (department_id) {
      axios.get(`http://localhost:5000/departments/${department_id}`)
        .then((res) => setDepartmentName(res.data.name))
        .catch(() => setDepartmentName('(取得失敗)'));
    }

    if (doctor_id) {
      axios.get(`http://localhost:5000/doctors/${doctor_id}`)
        .then((res) => setDoctorName(res.data.name))
        .catch(() => setDoctorName('(取得失敗)'));
    }
  }, [facility_id, department_id, doctor_id]);

  const handleGoToMyPage = () => {
    router.push(`/mypage?group_id=${group_id}&facility_id=${facility_id}`);
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-6">予約完了</h1>
      <p className="text-lg mb-6">ご予約ありがとうございます。予約が正常に完了しました。</p>

      {/* 選択内容の表示（ボタン直上） */}
      <div className="text-sm text-gray-700 mb-6 text-left">
        <p>選択された施設：{facilityName}</p>
        <p>診療科：{departmentName}</p>
        <p>担当医：{doctorName}</p>
      </div>

      <button
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        onClick={handleGoToMyPage}
      >
        マイページへ戻る
      </button>
    </div>
  );
}
