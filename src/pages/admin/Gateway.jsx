import { useAuth } from '@/hooks/useAuth';

export default function Gateway() {
  const { loginWithLocale, isAuthenticated, isLoading, user } = useAuth();

  console.log('Gateway', { isAuthenticated, isLoading, user });
  if (isLoading) {
    return <></>;
  } else if (!isAuthenticated) {
    loginWithLocale();
    return <></>;
  }
}
