import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@/components/common/Popover';
import { useState } from 'react';
import { LuMapPin, LuSearch } from 'react-icons/lu';

import isEmpty from 'lodash/isEmpty';
import { Button } from '@/components/common';

export default function SearchBox({
  placeholder = 'Buscar lugar...',
  useSearchHook,
  onResultSelected,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const { results, loading } = useSearchHook(searchTerm);

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-full focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow"
            />
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
          </div>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            className="mt-2 max-h-[50vh] z-20 shadow shadow-secondary/20 overflow-y-scroll p-0"
            style={{
              width: 'var(--radix-popover-trigger-width)',
            }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {loading ? (
              <p className="text-secondary-600 p-4">Cargando...</p>
            ) : !isEmpty(results) ? (
              <div className="h-full w-full flex flex-col divide-solid divide-y-[1px] divide-neutral-200 p-0 items-center justify-center">
                {results.map((result, index) => (
                  <PopoverClose key={index} asChild>
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
                ))}
              </div>
            ) : !isEmpty(searchTerm) ? (
              <p className="text-secondary-500 p-4 h-full w-full">
                No se encontraron resultados
              </p>
            ) : (
              <p className="text-secondary-500 p-4">Escribe algo para buscar</p>
            )}
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
}
