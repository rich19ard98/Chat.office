import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useSessionCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token'); // ou sessionStorage
      if (!token) {
        // pas de token → redirection vers login
        navigate('/login');
        return;
      }

      // Si tu stockes la date d'expiration
      const expireTime = localStorage.getItem('expireTime'); // timestamp
      if (expireTime && Date.now() > parseInt(expireTime)) {
        // session expirée
        localStorage.clear(); // ou removeItem('token')
        navigate('/login');
      }
    }, 1000 * 60); // vérifie toutes les minutes

    return () => clearInterval(interval);
  }, [navigate]);
};

export default useSessionCheck;
