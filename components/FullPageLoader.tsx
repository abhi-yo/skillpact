import { Loader2 } from 'lucide-react';

export default function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
    </div>
  );
} 