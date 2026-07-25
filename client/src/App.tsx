import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

import AnimatedBackground from './components/shared/AnimatedBackground';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnimatedBackground />
      <div className="relative z-0 min-h-screen">
        <RouterProvider router={router} />
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
    </QueryClientProvider>
  );
}
