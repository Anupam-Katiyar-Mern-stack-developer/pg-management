// src/components/shared/SearchBar.tsx
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../common';

interface SearchBarProps {
    placeholder?: string;
    initialValue?: string;
    buttonText?: string;
    showButton?: boolean;
    onSearch: (query: string) => void;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search by city, locality, or PG name...',
    initialValue = '',
    buttonText = 'Search',
    showButton = true,
    onSearch,
    className = '',
}) => {
    const [query, setQuery] = useState<string>(initialValue);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(query.trim());
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all flex items-center gap-2 ${className}`}
        >
            <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />

            <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuery(e.target.value)
                }
                placeholder={placeholder}
                className="w-full py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />

            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {showButton && (
                <Button type="submit" size="sm" className="shrink-0">
                    {buttonText}
                </Button>
            )}
        </form>
    );
};