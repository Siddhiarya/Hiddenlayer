import React, { useState, useMemo, ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => any);
  render?: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filterControls?: ReactNode;
  actions?: ReactNode;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchFilter,
  filterControls,
  actions,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
  pageSize = 10,
  onRowClick,
  keyExtractor = (_, index) => String(index),
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    if (searchFilter) {
      return data.filter(item => searchFilter(item, searchQuery.trim().toLowerCase()));
    }
    return data.filter(item =>
      Object.values(item).some(
        val =>
          val &&
          typeof val === 'string' &&
          val.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    );
  }, [data, searchQuery, searchFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <TableSkeleton rows={pageSize} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      {(searchFilter || filterControls || actions) && (
        <div className="p-4 sm:p-5 border-b border-surface-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-50/40">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {searchFilter && (
              <div className="relative min-w-[240px] max-w-sm flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-xs sm:text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            )}
            {filterControls}
          </div>
          {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50/75 text-[11px] font-bold text-surface-500 uppercase tracking-wider">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3.5 px-4 sm:px-5 ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-xs sm:text-sm text-surface-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    icon={Inbox}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors hover:bg-surface-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => {
                    let cellValue: ReactNode = null;
                    if (col.render) {
                      cellValue = col.render(row);
                    } else if (typeof col.accessor === 'function') {
                      cellValue = col.accessor(row);
                    } else if (col.accessor) {
                      cellValue = row[col.accessor];
                    }

                    return (
                      <td
                        key={colIndex}
                        className={`py-3.5 px-4 sm:px-5 align-middle ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > pageSize && (
        <div className="p-4 border-t border-surface-100 flex items-center justify-between bg-surface-50/40 text-xs text-surface-500">
          <span>
            Showing <strong className="text-surface-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-surface-800">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </strong>{' '}
            of <strong className="text-surface-800">{filteredData.length}</strong> results
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-surface-200 bg-white text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-surface-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-surface-200 bg-white text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
