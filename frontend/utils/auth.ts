// frontend/utils/auth.ts
import axios from 'axios';

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await axios.get('http://localhost:5000/me', {
      withCredentials: true,
    });
    return response.status === 200;
  } catch (err) {
    return false;
  }
};
