import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 animate-spin">
                <div className="h-full w-full border-4 border-indigo-500 dark:border-indigo-400 rounded-full"></div>
              </div>
              <div className="absolute inset-2 flex items-center justify-center">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logo.png"
                    alt="UPA Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">Loading team data...</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
      </div>
    </div>
  );
}
