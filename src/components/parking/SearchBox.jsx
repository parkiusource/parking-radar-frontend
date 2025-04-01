import { useState, useEffect, useCallback, forwardRef, memo } from 'react';

import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { LuMapPin, LuX } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/components/common/Button/Button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@/components/common/Popover';
import { Input } from '@/components/common/Input';

// Memoize static messages
const STATUS_MESSAGES = {
  loading: 'Cargando...',
  noResults: 'No se encontraron resultados'
};

// Memoized result item component
const ResultItem = memo(({ result, onSelect, onClose }) => (
  <div className="w-full">
    <PopoverClose asChild>
      <Button
        variant="flat"
        className="flex-col items-start py-2 w-full h-full text-left gap-1"
        onClick={() => {
          onClose();
          onSelect(result);
        }}
        role="option"
        aria-selected={false}
      >
        <h3 className="flex items-center gap-2 w-full text-sm text-ellipsis overflow-hidden font-light">
          <LuMapPin className="text-primary text-xs" aria-hidden="true" />
          {result.displayName.text}
        </h3>
        <p className="w-full text-xs text-ellipsis overflow-hidden">
          {result.formattedAddress}
        </p>
      </Button>
    </PopoverClose>
  </div>
));

ResultItem.displayName = 'ResultItem';

// Memoized status message component
const StatusMessage = memo(({ message }) => (
  <p className="text-secondary-500 p-4" role="status">{message}</p>
));

StatusMessage.displayName = 'StatusMessage';

const SearchBox = forwardRef(({
  children,
  className,
  placeholder = 'Buscar lugar...',
  onResultSelected,
  useSearchHook,
  value,
}, ref) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  const { results, isPending: loading } = useSearchHook(searchTerm);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setPopoverOpen(!isEmpty(newValue));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPopoverOpen(false);
  }, []);

  const handleResultSelect = useCallback((result) => {
    onResultSelected(result);
  }, [onResultSelected]);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  const handlePopoverOpen = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleInteractOutside = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  return (
    <div className={twMerge('w-full', className)}>
      <Popover open={popoverOpen && !isEmpty(searchTerm)}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={ref}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full py-2 pl-8 pr-4 text-base"
              aria-label="Buscar lugar"
              aria-expanded={popoverOpen}
              aria-controls="search-results"
              aria-haspopup="listbox"
              role="combobox"
            />
            {children}
            {!isEmpty(searchTerm) && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400"
                onClick={handleClearSearch}
                type="button"
                aria-label="Limpiar búsqueda"
              >
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            className="mt-2 max-h-[50vh] z-60 shadow shadow-secondary/20 overflow-y-scroll p-0"
            style={{
              width: 'var(--radix-popover-trigger-width)',
            }}
            onOpenAutoFocus={handlePopoverOpen}
            onInteractOutside={handleInteractOutside}
            role="listbox"
            id="search-results"
            aria-label="Resultados de búsqueda"
          >
            {loading ? (
              <StatusMessage message={STATUS_MESSAGES.loading} />
            ) : !isEmpty(results) ? (
              <div className="h-full w-full flex flex-col divide-solid divide-y-[1px] divide-neutral-200 p-0 items-center justify-center">
                {results.map((result, index) => (
                  <ResultItem
                    key={index}
                    result={result}
                    onSelect={handleResultSelect}
                    onClose={handlePopoverClose}
                  />
                ))}
              </div>
            ) : (
              <StatusMessage message={STATUS_MESSAGES.noResults} />
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
});

SearchBox.displayName = 'SearchBox';

SearchBox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onResultSelected: PropTypes.func.isRequired,
  useSearchHook: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export { SearchBox };
