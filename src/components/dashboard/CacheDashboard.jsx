import { useState, useEffect } from 'react';
import cacheService from '../../services/cacheService';
import { Trash2, RefreshCw, Database, Clock } from 'lucide-react';

const CacheDashboard = () => {
  const [cacheStats, setCacheStats] = useState({
    memorySize: 0,
    localStorageSize: 0,
    sessionStorageSize: 0
  });

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    // Count memory cache
    let memorySize = 0;
    for (const [key, value] of cacheService.memoryCache.entries()) {
      memorySize += JSON.stringify(value).length;
    }

    // Count localStorage
    let localStorageSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      localStorageSize += (key?.length || 0) + (value?.length || 0);
    }

    // Count sessionStorage
    let sessionStorageSize = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      sessionStorageSize += (key?.length || 0) + (value?.length || 0);
    }

    setCacheStats({
      memorySize,
      localStorageSize,
      sessionStorageSize
    });
  };

  const clearCache = (type) => {
    if (type === 'memory') {
      cacheService.clear('memory');
    } else if (type === 'local') {
      localStorage.clear();
    } else if (type === 'session') {
      sessionStorage.clear();
    } else if (type === 'all') {
      cacheService.clear('memory');
      localStorage.clear();
      sessionStorage.clear();
    }
    updateStats();
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-blue-600" />
        Cache Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Memory Cache</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatSize(cacheStats.memorySize)}</p>
          <button
            onClick={() => clearCache('memory')}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Local Storage</span>
            <Database className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatSize(cacheStats.localStorageSize)}</p>
          <button
            onClick={() => clearCache('local')}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Session Storage</span>
            <RefreshCw className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatSize(cacheStats.sessionStorageSize)}</p>
          <button
            onClick={() => clearCache('session')}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => clearCache('all')}
          className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Cache
        </button>
        <button
          onClick={updateStats}
          className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default CacheDashboard;