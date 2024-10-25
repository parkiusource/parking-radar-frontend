import { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { LuMapPin } from 'react-icons/lu';
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

const getStatusMessage = ({ loading, results }) => {
  if (loading) return 'Cargando...';
  if (isEmpty(results)) return 'No se encontraron resultados';
};

const SearchBox = ({
  children,
  className,
  placeholder = 'Buscar lugar...',
  onResultSelected,
  useSearchHook,
  value,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { results, isPending: loading } = useSearchHook(searchTerm);

  return (
    <div className={twMerge('w-full', className)}>
      <Popover open={!isEmpty(searchTerm)}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              type="text"
              placeholder={placeholder}
              value={value || searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-8 text-ellipsis"
            />
            {children}
          </div>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            className="mt-2 max-h-[50vh] z-60 shadow shadow-secondary/20 overflow-y-scroll p-0"
            style={{
              width: 'var(--radix-popover-trigger-width)',
            }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {!isEmpty(results) ? (
              <div className="h-full w-full flex flex-col divide-solid divide-y-[1px] divide-neutral-200 p-0 items-center justify-center">
                {results.map((result, index) => (
                  <div className="w-full" key={index}>
                    <PopoverClose asChild>
                      <Button
                        variant="flat"
                        className="flex-col items-start py-2 w-full h-full text-left gap-1"
                        onClick={() => {
                          setSearchTerm('');
                          onResultSelected(result);
                        }}
                      >
                        <h3 className="flex items-center gap-2 w-full text-sm text-ellipsis overflow-hidden font-light">
                          <LuMapPin className="text-primary text-xs" />
                          {result.displayName.text}
                        </h3>
                        <p className="w-full text-xs text-ellipsis overflow-hidden">
                          {result.formattedAddress}
                        </p>
                      </Button>
                    </PopoverClose>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary-500 p-4">
                {getStatusMessage({ loading, searchTerm, results })}
              </p>
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
};

export { SearchBox };
