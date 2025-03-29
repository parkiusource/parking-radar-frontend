import { useTranslation } from 'react-i18next';

export const Stats = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{t('stats.title', 'Nuestros números')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">+500</div>
            <div className="text-gray-600">{t('stats.parkings', 'Parqueaderos registrados')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">+10,000</div>
            <div className="text-gray-600">{t('stats.users', 'Usuarios activos')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">+25,000</div>
            <div className="text-gray-600">{t('stats.searches', 'Búsquedas mensuales')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">+30</div>
            <div className="text-gray-600">{t('stats.cities', 'Ciudades')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
