import { useState, useEffect, useCallback, forwardRef } from 'react';

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

const getStatusMessage = ({ loading, results }) => {
  if (loading) return 'Cargando...';
  if (isEmpty(results)) return 'No se encontraron resultados';
};

// Convertir a forwardRef para poder recibir referencias desde el componente padre
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

  // Actualizar searchTerm cuando cambia el valor externo
  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  const { results, isPending: loading } = useSearchHook(searchTerm);

  // Función optimizada para manejar cambios en el input
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // Solo mostramos el popover si hay texto
    if (!isEmpty(newValue)) {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  }, []);

  // Función para limpiar la búsqueda
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
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
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            onInteractOutside={() => {
              setPopoverOpen(false);
            }}
          >
            {loading && (
              <p className="text-secondary-500 p-4">Cargando...</p>
            )}

            {!loading && !isEmpty(results) ? (
              <div className="h-full w-full flex flex-col divide-solid divide-y-[1px] divide-neutral-200 p-0 items-center justify-center">
                {results.map((result, index) => (
                  <div className="w-full" key={index}>
                    <PopoverClose asChild>
                      <Button
                        variant="flat"
                        className="flex-col items-start py-2 w-full h-full text-left gap-1"
                        onClick={() => {
                          // Cerramos el popover y limpiamos la búsqueda
                          setPopoverOpen(false);
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
            ) : !loading && (
              <p className="text-secondary-500 p-4">
                {getStatusMessage({ loading, searchTerm, results })}
              </p>
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
