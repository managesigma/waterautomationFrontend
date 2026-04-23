import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect root to login, layout or logic handles where they actually go based on RBAC
  redirect('/login');
}
