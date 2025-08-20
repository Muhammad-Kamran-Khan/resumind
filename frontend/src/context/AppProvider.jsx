import { UserProvider } from './UserContext';
import { ResumeProvider } from './ResumeContext';

// This component combines all individual providers into one for convenience.
export const AppProvider = ({ children }) => {
  return (
    <UserProvider>
      <ResumeProvider>
        {children}
      </ResumeProvider>
    </UserProvider>
  );
};
