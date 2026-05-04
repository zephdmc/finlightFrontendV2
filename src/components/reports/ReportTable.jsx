import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Search, Filter, X, Eye, FileText, TrendingUp } from 'lucide-react';

/**
 * Report Table Component - Banking App Style
 * Reusable table component for displaying report data with pagination and export
 */
const ReportTable = ({ 
  data, 
  columns, 
  title, 
  onExport, 
  loading = false,
  showSearch = true,
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const itemsPerPage = isMobile ? 5 : 10;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get unique filter options for each column
  const getFilterOptions = (columnKey) => {
    if (!data) return [];
    const uniqueValues = [...new Set(data.map(item => item[columnKey]).filter(Boolean))];
    return uniqueValues.slice(0, 10); // Limit to 10 options
  };

  // Filter data based on search term and active filters
  const filteredData = data?.filter(item => {
    // Search filter
    if (searchTerm) {
      const matchesSearch = columns.some(column => {
        const value = item[column.key];
        if (!value) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!matchesSearch) return false;
    }
    
    // Column filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && item[key] !== value) return false;
    }
    
    return true;
  }) || [];

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key) => {
    if (sortColumn !== key) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || Object.keys(activeFilters).length > 0;

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded mb-3"></div>
          {[...Array(isMobile ? 3 : 5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="font-semibold text-lg">{title}</h2>
            </div>
            <p className="text-blue-100 text-xs mt-1">
              {sortedData.length} record{sortedData.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {onExport && sortedData.length > 0 && (
            <button
              onClick={onExport}
              className="px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-1 text-sm"
            >
              <Download className="h-4 w-4" />
              {!isMobile && "Export"}
            </button>
          )}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-10 py-2.5 bg-white/10 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-white/50" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-white/80">×</button>
              </span>
            )}
            {Object.entries(activeFilters).map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs">
                {key}: {value}
                <button onClick={() => {
                  setActiveFilters(prev => {
                    const newFilters = { ...prev };
                    delete newFilters[key];
                    return newFilters;
                  });
                  setCurrentPage(1);
                }} className="hover:text-white/80">×</button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="px-2 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {paginatedData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No data available</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-blue-600 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            paginatedData.map((row, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 space-y-3">
                  {columns.map((column) => {
                    const value = row[column.key];
                    if (value === undefined || value === null) return null;
                    
                    let displayValue = value;
                    if (column.key.includes('amount') || column.key === 'total' || column.key === 'price') {
                      displayValue = formatCurrency(value);
                    } else if (column.key === 'date' || column.key.includes('Date')) {
                      displayValue = new Date(value).toLocaleDateString();
                    }
                    
                    return (
                      <div key={column.key} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{column.label}</span>
                        <div className="text-sm font-medium text-gray-900 text-right">
                          {column.render ? column.render(value, row) : displayValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.sortable !== false && (
                          <span className="text-gray-400 text-xs">{getSortIcon(column.key)}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column) => {
                        const value = row[column.key];
                        let displayValue = value;
                        if (column.key.includes('amount') || column.key === 'total' || column.key === 'price') {
                          displayValue = formatCurrency(value);
                        } else if (column.key === 'date' || column.key.includes('Date')) {
                          displayValue = value ? new Date(value).toLocaleDateString() : '-';
                        }
                        
                        return (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {column.render ? column.render(value, row) : displayValue || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers - simplified for mobile */}
            {!isMobile && (
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Footer for Mobile */}
      {isMobile && sortedData.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">Total Records</span>
            </div>
            <span className="font-bold text-blue-600">{sortedData.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;