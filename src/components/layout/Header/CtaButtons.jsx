import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { CircleParking } from 'lucide-react';
import { Button } from '@/components/common';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';

const ADMIN_URL = 'https://admin.parkiu.com'; // URL del nuevo repositorio de administración

const CtaButtons = ({ className }) => {
  const { t } = useTranslation();

  return (
    <div className={twMerge("flex flex-row gap-2 lg:gap-4 items-center w-full md:w-auto", className)}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
      >
        <Link to="/parking" className="w-full block">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white border-white hover:bg-white/10"
          >
            <Search className="w-4 h-4 md:w-5 md:h-5" />
            <span className="whitespace-nowrap">{t('header.ctaButtons.search', 'Buscar')}</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 md:flex-auto"
        transition={{ delay: 1 }}
      >
        <a href={ADMIN_URL} className="w-full block">
          <Button
            className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90"
          >
            <CircleParking className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Administrar mi parqueadero</span>
          </Button>
        </a>
      </motion.div>
    </div>
  );
};

CtaButtons.displayName = 'CtaButtons';

CtaButtons.propTypes = {
  className: PropTypes.string,
};

export { CtaButtons };
