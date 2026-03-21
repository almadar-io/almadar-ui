'use client';
/**
 * DocSearch Molecule
 *
 * A search input with results dropdown for documentation sites.
 * Composed from Box, VStack, Typography, Icon, and Input atoms.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack } from '../atoms/Stack';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';

export interface DocSearchResult {
  title: string;
  href: string;
  excerpt?: string;
  category?: string;
}

export interface DocSearchProps {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Callback invoked with the search query, returns results */
  onSearch?: (query: string) => DocSearchResult[] | Promise<DocSearchResult[]>;
  /** Additional class names */
  className?: string;
}

export function DocSearch({
  placeholder = 'Search documentation...',
  onSearch,
  className,
}: DocSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    (value: string) => {
      if (!onSearch || !value.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      const searchResult = onSearch(value.trim());
      if (searchResult instanceof Promise) {
        void searchResult.then((items) => {
          setResults(items);
          setIsOpen(items.length > 0);
          setActiveIndex(-1);
        });
      } else {
        setResults(searchResult);
        setIsOpen(searchResult.length > 0);
        setActiveIndex(-1);
      }
    },
    [onSearch],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    },
    [performSearch],
  );

  const handleFocus = useCallback(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  const navigateTo = useCallback((href: string) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    window.location.href = href;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (!isOpen || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = activeIndex >= 0 ? activeIndex : 0;
        if (results[idx]) {
          navigateTo(results[idx].href);
        }
      }
    },
    [isOpen, results, activeIndex, navigateTo],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Box
      position="relative"
      className={cn('w-full', className)}
      ref={containerRef}
    >
      {/* Search input */}
      <Box position="relative">
        <Input
          inputType="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          leftIcon={<Icon name="search" size="sm" className="text-[var(--color-muted-foreground)]" />}
          clearable={query.length > 0}
          onClear={() => {
            setQuery('');
            setResults([]);
            setIsOpen(false);
          }}
        />
      </Box>

      {/* Results dropdown */}
      {isOpen && results.length > 0 ? (
        <Box
          position="absolute"
          className="top-full left-0 right-0 mt-1 z-50 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] max-h-80 overflow-y-auto"
        >
          <VStack gap="none">
            {results.map((result, index) => (
              <Box
                key={`${result.href}-${index}`}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors',
                  'hover:bg-[var(--color-muted)]',
                  index === activeIndex && 'bg-[var(--color-muted)]',
                  index < results.length - 1 &&
                    'border-b border-[var(--color-border)]',
                )}
                onClick={() => navigateTo(result.href)}
                role="option"
                tabIndex={-1}
              >
                <VStack gap="xs">
                  <HStack align="center" gap="sm">
                    {result.category ? (
                      <Typography variant="caption" color="muted">
                        {result.category}
                      </Typography>
                    ) : null}
                    <Typography variant="body" weight="medium">
                      {result.title}
                    </Typography>
                  </HStack>
                  {result.excerpt ? (
                    <Typography
                      variant="caption"
                      color="muted"
                      truncate
                    >
                      {result.excerpt}
                    </Typography>
                  ) : null}
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      ) : null}
    </Box>
  );
}
