import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/lib/auth-server';

export default async function Home() {
  const user = await getCurrentUserServer();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  // If not logged in, redirect to login
  redirect('/auth/login');
}
