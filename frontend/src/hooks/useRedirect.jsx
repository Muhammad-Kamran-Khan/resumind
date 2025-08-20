import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function useRedirect(redirectPath) {
  // Correct the function name from fetchLoginStatus to userLoginStatus
  const { userLoginStatus } = useUser(); 
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!(await userLoginStatus())) { // Call the correct function
        navigate(redirectPath);
      }
    })();
  }, [redirectPath, userLoginStatus, navigate]);
}