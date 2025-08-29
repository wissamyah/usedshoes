import GitHubSettings from './GitHubSettings';
import DataFileSelector from '../DataFileSelector';
import { useGitHub } from '../../context/GitHubContext';

export default function SettingsPage() {
  const { isConnected } = useGitHub();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your application settings and integrations.
                </p>
              </div>
              {isConnected && (
                <DataFileSelector />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <GitHubSettings />
          </div>
        </div>
      </div>
    </div>
  );
}