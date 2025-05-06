// frontend/utils/withAuth.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const ProtectedPage = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const checkLogin = async () => {
        try {
          await axios.get('http://localhost:5000/check', { withCredentials: true });
        } catch (err) {
          console.error('認証チェック失敗:', err);
          router.replace('/login');
        }
      };

      checkLogin();
    }, []);

    return <WrappedComponent {...props} />;
  };

  return ProtectedPage;
};

export default withAuth;
