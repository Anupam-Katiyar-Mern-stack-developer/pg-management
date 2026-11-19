import React from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T;
    render?: (item: T) => React.ReactNode;
    className?: string;
}


interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    isLoading?: boolean;
    onRawClick?: (item: T) => void;
}

export function Table<T>({
    data,
    columns, keyExtractor,
    emptyMessage = 'No records found',
    isLoading = false,
    onRawClick,
}: TableProps<T>) {
    return (
        <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-slate-400"
                                >
                                    Loading data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-slate-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={`transition-colors ${onRowClick
                                            ? 'cursor-pointer hover:bg-slate-50'
                                            : 'hover:bg-slate-50/60'
                                        }`}
                                >
                                    {columns.map((col, idx) => (
                                        <td
                                            key={idx}
                                            className={`px-4 py-3.5 whitespace-nowrap ${col.className || ''}`}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : String(item[col.accessor] ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}