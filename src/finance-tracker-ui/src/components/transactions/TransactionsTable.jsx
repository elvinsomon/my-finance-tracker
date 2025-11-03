import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const TransactionsTable = ({
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Column definitions
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Date
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {formatDate(row.getValue('date'))}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Description
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate text-slate-700 dark:text-slate-300">
            {row.getValue('description')}
          </div>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Category
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const category = row.getValue('categoryName');
          return category ? (
            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {category}
            </Badge>
          ) : (
            <span className="text-slate-400 dark:text-slate-600 text-sm">Uncategorized</span>
          );
        },
      },
      {
        accessorKey: 'accountName',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Account
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => (
          <div className="text-slate-700 dark:text-slate-300">
            {row.getValue('accountName') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('type');

          // Custom badge styles for better light mode appearance
          const getBadgeStyles = (type) => {
            switch (type) {
              case 'Income':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
              case 'Expense':
                return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
              case 'Transfer':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
              default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            }
          };

          return (
            <Badge variant="outline" className={getBadgeStyles(type)}>
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Amount
              {column.getIsSorted() === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const type = row.original.type;
          const amount = row.getValue('amount');
          const currency = row.original.currency;
          const isIncome = type === 'Income';
          const isExpense = type === 'Expense';

          return (
            <div className={`font-semibold ${
              isIncome
                ? 'text-green-600 dark:text-green-500'
                : isExpense
                ? 'text-red-600 dark:text-red-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {isIncome ? '+' : isExpense ? '-' : ''}
              {formatCurrency(amount, currency)}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const transaction = row.original;

          return (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction)}
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} transaction(s)?`)) {
      const selectedIds = selectedRows.map(row => row.original.id);
      onBulkDelete?.(selectedIds);
      setRowSelection({});
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-slate-200/60 dark:border-slate-800/60">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6">
            <svg
              className="h-12 w-12 text-slate-400 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              No transactions found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Try adjusting your filters or add a new transaction
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {hasSelection && (
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-blue-50/60 dark:bg-blue-950/40 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedRows.length} transaction(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/80">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={`border-slate-200/60 dark:border-slate-800/60 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white/20 dark:bg-slate-900/20'
                        : 'bg-slate-50/20 dark:bg-slate-800/20'
                    } hover:bg-slate-100/60 dark:hover:bg-slate-800/60`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700 dark:text-slate-300">Rows per page:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page info */}
          <div className="text-sm text-slate-700 dark:text-slate-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            {' '}({data.length} total)
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 p-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 p-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
