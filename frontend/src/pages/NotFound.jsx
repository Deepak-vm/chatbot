import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="text-center space-y-3">
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">
          404
        </div>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Home size={15} />
          Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2937] hover:bg-[#374151] text-gray-300 text-sm font-medium rounded-xl transition-colors"
        >
          <ArrowLeft size={15} />
          Go Back
        </button>
      </div>
    </div>
  );
}
