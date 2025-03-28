import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Recursos de traducción
const resources = {
  es: {
    translation: {
      header: {
        menu: {
          aboutUs: 'Nosotros',
          support: 'Soporte',
        },
        ctaButtons: {
          search: 'Buscar',
          manageParking: 'Administrar mi parqueadero',
        }
      },
      footer: {
        description: 'La plataforma líder para encontrar y gestionar parqueaderos en tiempo real.',
        quickLinks: {
          title: 'Enlaces rápidos',
          home: 'Inicio',
          searchParking: 'Buscar parqueaderos',
          manageParking: 'Administrar parqueadero',
          aboutUs: 'Acerca de nosotros',
        },
        legal: {
          title: 'Legal',
          termsAndConditions: 'Términos y condiciones',
          privacyPolicy: 'Política de privacidad',
          cookiePolicy: 'Política de cookies',
          support: 'Soporte',
        },
        contact: {
          title: 'Contacto',
        },
        allRightsReserved: 'ParkiÜ. Todos los derechos reservados.',
      },
      hero: {
        title: 'Encuentra el parqueadero',
        titleHighlighted: 'ideal en segundos',
        subtitle: 'Información en tiempo real sobre disponibilidad, tarifas y seguridad',
        findNow: 'Buscar ahora',
        btn: {
          seeAllParkingLots: 'Ver todos los parqueaderos',
        },
        features: {
          availability: 'Disponibilidad en tiempo real',
          rates: 'Tarifas actualizadas',
          reviews: 'Reseñas verificadas',
          security: 'Seguridad garantizada'
        }
      },
      cta: {
        title: 'Descarga nuestra app',
        description: 'Accede a todas las funcionalidades desde tu dispositivo móvil',
        downloadApp: 'Descargar app',
        learnMore: 'Saber más',
        findParkings: 'Comenzar a buscar parqueaderos'
      },
      // Agregamos traducciones para las características
      features: {
        title: 'Características principales',
        location: {
          title: 'Ubicación en tiempo real',
          description: 'Encuentra los parqueaderos más cercanos a tu ubicación con información actualizada.'
        },
        prices: {
          title: 'Precios transparentes',
          description: 'Conoce las tarifas de cada parqueadero antes de llegar para evitar sorpresas.'
        },
        security: {
          title: 'Seguridad garantizada',
          description: 'Evaluaciones y comentarios de usuarios para conocer la seguridad de cada parqueadero.'
        },
        // Página de Features
        page: {
          aboutUs: {
            title: 'SOBRE NOSOTROS',
            iconAlt: 'Icono de presentación',
            description: 'Este proyecto surgió como parte de la Especialización en Ingeniería de Software de la Universidad Antonio Nariño. Fue desarrollado por estudiantes a lo largo del año académico 2024,'
          }
        }
      },
      // Agregamos traducciones para las estadísticas
      stats: {
        title: 'Nuestros números',
        parkings: 'Parqueaderos registrados',
        users: 'Usuarios activos',
        searches: 'Búsquedas mensuales',
        cities: 'Ciudades',
        cards: {
          parking: {
            title: 'Parqueaderos',
            description: 'registrados en Bogotá',
          },
          users: {
            title: 'Usuarios',
            description: 'activos mensuales',
          },
          satisfaction: {
            title: 'Satisfacción',
            description: 'de nuestros usuarios',
          },
          availability: {
            title: 'Disponibilidad',
            description: 'servicio ininterrumpido',
          },
        },
      },
      // Traducciones para el buscador
      search: {
        placeholder: 'Buscar por zona, dirección o referencia',
        recentSearches: 'Búsquedas recientes'
      },
      // Traducciones para la sección de administrador
      admin: {
        sectionTitle: 'Potencia tu negocio con',
        description: 'Únete a la red de parqueaderos más grande y moderna. Optimiza tus operaciones y aumenta tus ingresos.',
        registerButton: 'Administrar mi parqueadero',
        loginButton: '¿Ya tienes cuenta?',
        loginButtonAction: 'Iniciar sesión',
        platformImage: 'Plataforma de administración de parqueaderos ParkiÜ',
        benefits: {
          visibility: 'Mayor visibilidad digital',
          clients: 'Atrae nuevos clientes',
          income: 'Optimiza tus ingresos',
          management: 'Gestión simplificada'
        },
        btn: {
          manageParking: 'Administrar mi parqueadero',
          login: 'Iniciar sesión',
        },
      },
      // Traducciones para la sección Cómo funciona
      howItWorks: {
        sectionTitle: 'Cómo funciona ParkiÜ',
        subtitle: 'Encuentra, compara y reserva parqueaderos de forma rápida y segura',
        search: {
          title: 'Busca',
          description: 'Encuentra parqueaderos verificados cerca de ti con disponibilidad e información actualizada'
        },
        compare: {
          title: 'Compara',
          description: 'Analiza precios, valoraciones y servicios para elegir la mejor opción para ti'
        },
        contribute: {
          title: 'Contribuye',
          description: 'Comparte tu experiencia y ayuda a otros conductores a tomar mejores decisiones'
        }
      },
      // Traducciones para testimonios
      testimonials: {
        sectionTitle: 'Lo que dicen nuestros usuarios',
        subtitle: 'Miles de conductores y administradores confían en ParkiÜ',
        carlos: {
          name: 'Carlos Ramírez',
          role: 'Conductor',
          text: 'ParkiÜ me ha ahorrado mucho tiempo y estrés. Ahora encuentro parqueadero en minutos y puedo planificar mejor mis salidas.'
        },
        maria: {
          name: 'María González',
          role: 'Administradora de Parqueadero',
          text: 'Desde que registré mi parqueadero en ParkiÜ, he aumentado mis clientes en un 30%. La plataforma es intuitiva y fácil de usar.'
        },
        andres: {
          name: 'Andrés Martínez',
          role: 'Conductor frecuente',
          text: 'Las reseñas y comentarios me ayudan a elegir parqueaderos seguros. La información actualizada de disponibilidad es invaluable.'
        },
        btn: {
          startLooking: 'Comenzar a buscar parqueaderos',
        },
      },
      // Traducciones para CTA
      ctaSection:{
        sectionTitle: '¿Listo para encontrar tu parqueadero ideal?',
        subtitle: 'Únete a miles de conductores que ya disfrutan de una experiencia de parqueo sin estrés',
        btn: {
          findNearbyParking: 'Encontrar parqueaderos cercanos',
          manageParking: 'Administrar mi parqueadero',
        },
      },
      // Traducciones para Expansion
      expansionSection:{
        sectionTitle: 'Encuentra parqueaderos en ',
        subtitle: 'Iniciamos en Bogotá y estamos expandiéndonos a las principales ciudades del país para brindarte la mejor experiencia de parqueo donde quiera que vayas.',
        availableNow : 'Disponible ahora',
        comingSoon : 'Próximamente',
        majorCities : 'Ciudades principales',
        potentialDrivers : 'Conductores potenciales',
      },
      // Traducciones para SEO
      seo: {
        title: 'ParkiÜ - Encuentra el mejor parqueadero cerca de ti | Información en tiempo real',
        description: 'ParkiÜ te ayuda a encontrar parqueaderos disponibles en tiempo real. Consulta tarifas, disponibilidad, horarios y reseñas de parqueaderos cercanos a tu ubicación.',
        keywords: 'parqueaderos, estacionamiento, parking, parqueo, lugares para parquear, tarifas parking, disponibilidad, seguridad',
        ogTitle: 'ParkiÜ - Encuentra el mejor parqueadero cerca de ti',
        ogDescription: 'Encuentra parqueaderos disponibles en tiempo real con información de tarifas, disponibilidad, horarios y reseñas.'
      },
      // Traducciones para el diálogo de ubicación
      locationDialog: {
        title: '¿Por qué necesitamos tu ubicación?',
        description: 'Para mostrarte los parqueaderos más cercanos a tu ubicación actual y brindarte la mejor experiencia posible.',
        privacy: 'No almacenamos tu ubicación, solo la usamos para esta búsqueda.',
        btn: {
          cancel: 'Cancel',
          allow: 'Allow',
        },
      },
      // Traducciones para About.jsx
      about: {
        features: {
          locationAlgorithm: {
            title: 'Localización Inteligente',
            description: 'Algoritmos que encuentran parqueaderos según tu ubicación y preferencias.'
          },
          realTime: {
            title: 'Tiempo Real',
            description: 'Datos actualizados de disponibilidad, tarifas y horarios.'
          },
          timeSaving: {
            title: 'Ahorro de Tiempo',
            description: 'Reduce hasta un 70% el tiempo de búsqueda.'
          },
          community: {
            title: 'Comunidad',
            description: 'Red de usuarios que mantienen información actualizada.'
          },
          security: {
            title: 'Seguridad',
            description: 'Índices de seguridad basados en experiencias verificadas.'
          },
          predictive: {
            title: 'Análisis Predictivo',
            description: 'Anticipamos disponibilidad futura basada en patrones históricos.'
          }
        },
        mission: {
          title: 'Nuestra Misión',
          quote: 'Simplificar la experiencia de estacionamiento y contribuir a la movilidad sostenible.',
          vision: {
            title: 'Visión',
            description: 'Ser la plataforma líder en gestión inteligente de parqueaderos, creando ciudades más eficientes.'
          },
          values: {
            title: 'Valores',
            items: [
              'Innovación constante',
              'Transparencia',
              'Comunidad',
              'Impacto positivo'
            ]
          }
        },
        uniqueness: {
          title: 'Lo Que Nos Hace Únicos',
          description: 'Soluciones innovadoras para una mejor experiencia.'
        },
        impact: {
          title: 'Nuestro Impacto',
          users: 'Usuarios',
          parkings: 'Parqueaderos',
          cities: 'Ciudades',
          timeSaved: 'Ahorra tiempo'
        },
        team: {
          title: 'Nuestro Equipo',
          description: 'Profesionales apasionados por resolver problemas urbanos.',
          members: {
            ana: {
              name: 'Camilo León',
              role: 'CEO & Fundadora',
              bio: 'Especialista en soluciones de movilidad urbana.'
            },
            carlos: {
              name: 'David Bautista',
              role: 'CTO',
              bio: 'Desarrollador especializado en aplicaciones geoespaciales.'
            },
            sofia: {
              name: 'Pedro Castiblanco',
              role: 'Director de Operaciones',
              bio: 'Experto en logística urbana y optimización.'
            }
          }
        },
        cta: {
          title: '¿Listo para olvidar el estrés?',
          description: 'Únete a miles de usuarios con una experiencia de estacionamiento sin complicaciones.',
          findButton: 'Encontrar Parqueadero',
          registerButton: 'Administrar mi Parqueadero'
        }
      },
      // Añadimos traducciones para la página de parqueaderos
      parking: {
        loading: 'Buscando parqueaderos cercanos...',
        noResults: 'No se encontraron parqueaderos cerca de {{location}}',
        noResultsDefault: 'No se encontraron parqueaderos cercanos',
        resultsFound: 'Parqueaderos cerca de {{location}}',
        resultsFoundDefault: 'Parqueaderos cercanos',
        oneSpotFound: 'Se encontró {{count}} parqueadero en tu área',
        multipleSpotFound: 'Se encontraron {{count}} parqueaderos en tu área',
        tryDifferentLocation: 'Intenta con otra ubicación o amplía tu área de búsqueda'
      },
      adminLanding: {
        hero: {
          sectionTitle: 'Potencia tu parqueadero con',
          titleHighlighted: 'tecnología inteligente',
          description: 'Únete a la red de parqueaderos más innovadora de Colombia y transforma la manera en que gestionas tu negocio.',
          btn: {
            startNow: 'Comenzar ahora',
            scheduleDemo: 'Agendar demo',
          },
          stats:{
            increaseOccupancy: 'Aumento promedio en ocupación',
            managementTime: 'Reducción en tiempo de gestión',
            userSatisfaction: 'Satisfacción de los usuarios',
            technicalSupport: 'Soporte técnico',
          },
        },
        features:{
          title: 'Características diseñadas para tu éxito',
          description: 'Herramientas poderosas que transformarán la gestión de tu parqueadero',
          items:{
            realtimeAnalytics:{
              title: 'Analítica en tiempo real',
              description: 'Monitorea la ocupación y el rendimiento de tu parqueadero con datos actualizados al instante.'
            },
            customerManagement:{
              title: 'Gestión de clientes',
              description: 'Administra reservas, perfiles de usuarios y programas de fidelización desde un solo lugar.'
            },
            financialControl:{
              title: 'Control financiero',
              description: 'Seguimiento detallado de ingresos, facturación automática y reportes financieros.'
            },
            advancedSecurity:{
              title: 'Seguridad avanzada',
              description: 'Sistema de control de acceso y monitoreo de seguridad integrado.'
            },
          },
        },
        benefits:{
          title: 'Beneficios que impulsan tu negocio',
          description: 'Descubre cómo ParkiÜ puede ayudarte a optimizar tus operaciones y aumentar tus ingresos',
          items:{
            timeSavings:{
              title:'Ahorro de tiempo',
              description:'Automatiza tareas rutinarias y reduce el tiempo de gestión administrativa.'
            },
            increasedVisibility:{
              title:'Mayor visibilidad',
              description:'Aumenta tu presencia digital y atrae más clientes potenciales.'
            },
            mobileManagement:{
              title:'Gestión móvil',
              description:'Administra tu negocio desde cualquier lugar con nuestra app móvil.'
            },
            detailedReports:{
              title:'Reportes detallados',
              description:'Obtén insights valiosos con nuestros reportes personalizados.'
            },
          },
        },
        accessControlSystem:{
          title:'Gestión inteligente y simplificada',
          description:'Optimiza tus operaciones diarias con nuestra plataforma intuitiva. Diseñada para hacer la gestión de tu parqueadero más eficiente y rentable.',
          items: {
            economicSolution:{
              title:'Solución económica',
              description:'Optimiza costos sin comprometer calidad.',
            },
            simplifiedControl:{
              title:'Control simplificado',
              description:'Gestión eficiente de tu parqueadero.',
            },
            remoteAccess:{
              title:'Acceso remoto',
              description:'Administra tu negocio donde estés.',
            },
          },
          elementsSystem:{
            simplifiedControl: 'Control de entradas y salidas simplificado',
            billingSystem: 'Sistema de facturación integrado',
            realtimeReports: 'Reportes y estadísticas en tiempo real',
            tariffManagement: 'Gestión flexible de tarifas',
          },
          disclaimer: {
            title: 'Próximamente',
            description: 'Estamos trabajando en funcionalidades avanzadas como control automático de barreras e integración con sensores para brindarte una experiencia aún más completa.',
          },
          btn: {
            seeAllFeatures: 'Ver todas las características',
          }
        },
        cta: {
          title: '¿Listo para llevar tu parqueadero al siguiente nivel?',
          description: 'Únete a la red de parqueaderos más innovadora y comienza a ver resultados desde el primer día',
          btn:{
            registerParking: 'Registrar mi parqueadero',
            contactSales: 'Contactar a ventas'
          }
        }
      },
    }
  },
  en: {
    translation: {
      header: {
        menu: {
          aboutUs: 'About Us',
          support: 'Support',
        },
        ctaButtons: {
          search: 'Search',
          manageParking: 'Manage my parking lot',
        }
      },
      footer: {
        description: 'The leading platform to find and manage parking lots in real time.',
        quickLinks: {
          title: 'Quick links',
          home: 'Home',
          searchParking: 'Search for parking',
          manageParking: 'Manage parking lot',
          aboutUs: 'About us',
        },
        legal: {
          title: 'Legal',
          termsAndConditions: 'Terms and Conditions',
          privacyPolicy: 'Privacy Policy',
          cookiePolicy: 'Cookie Policy',
          support: 'Support',
        },
        contact: {
          title: 'Contact',
        },
        allRightsReserved: 'ParkiÜ. All rights reserved.',
      },
      hero: {
        title: 'Find the parking lot',
        titleHighlighted: 'ideal in seconds',
        subtitle: 'Real-time information on availability, rates and security',
        findNow: 'Find now',
        btn: {
          seeAllParkingLots: 'See all parking lots',
        },
        features: {
          availability: 'Real-time availability',
          rates: 'Updated rates',
          reviews: 'Verified reviews',
          security: 'Guaranteed security'
        }
      },
      cta: {
        title: 'Download our app',
        description: 'Access all features from your mobile device',
        downloadApp: 'Download app',
        learnMore: 'Learn more',
        findParkings: 'Start finding parking lots'
      },
      // English translations for features
      features: {
        title: 'Main Features',
        location: {
          title: 'Real-time Location',
          description: 'Find the nearest parking lots to your location with updated information.'
        },
        prices: {
          title: 'Transparent Pricing',
          description: 'Know the rates of each parking lot before arriving to avoid surprises.'
        },
        security: {
          title: 'Guaranteed Security',
          description: 'User ratings and comments to understand the security of each parking lot.'
        },
        // Features page
        page: {
          aboutUs: {
            title: 'ABOUT US',
            iconAlt: 'Presentation icon',
            description: 'This project emerged as part of the Software Engineering Specialization at the Antonio Nariño University. It was developed by students throughout the 2024 academic year,'
          }
        }
      },
      // English translations for stats
      stats: {
        title: 'Our Numbers',
        parkings: 'Registered Parking Lots',
        users: 'Active Users',
        searches: 'Monthly Searches',
        cities: 'Cities',
        cards: {
          parking: {
            title: 'Parking',
            description: 'registered in Bogotá',
          },
          users: {
            title: 'Users',
            description: 'monthly assets',
          },
          satisfaction: {
            title: 'Satisfaction',
            description: 'of our users',
          },
          availability: {
            title: 'Availability',
            description: 'uninterrupted service',
          },
        },
      },
      // English translations for search
      search: {
        placeholder: 'Search by area, address or landmark',
        recentSearches: 'Recent searches'
      },
      // English translations for admin section
      admin: {
        sectionTitle: 'Boost your business with',
        description: 'Join the largest and most modern parking network. Optimize your operations and increase your revenues.',
        registerButton: 'Register my parking lot',
        loginButton: 'Already have an account?',
        loginButtonAction: 'Log in',
        platformImage: 'ParkiÜ parking management platform',
        benefits: {
          visibility: 'Greater digital visibility',
          clients: 'Attract new customers',
          income: 'Optimize your income',
          management: 'Simplified management'
        },
        btn: {
          manageParking: 'Manage my parking lot',
          login: 'Log in',
        },
      },
      // English translations for How it works
      howItWorks: {
        sectionTitle: 'How ParkiÜ Works',
        subtitle: 'Find, compare and reserve parking spaces quickly and securely.',
        search: {
          title: 'Search',
          description: 'Find verified parking lots near you with availability and updated information'
        },
        compare: {
          title: 'Compare',
          description: 'Analyze prices, ratings and services to choose the best option for you'
        },
        contribute: {
          title: 'Contribute',
          description: 'Share your experience and help other drivers make better decisions'
        }
      },
      // English translations for testimonials
      testimonials: {
        sectionTitle: 'What our users say',
        subtitle: 'Thousands of drivers and managers rely on ParkiÜ',
        carlos: {
          name: 'Carlos Ramírez',
          role: 'Driver',
          text: 'ParkiÜ has saved me a lot of time and stress. Now I find parking in minutes and can better plan my outings.'
        },
        maria: {
          name: 'María González',
          role: 'Parking Manager',
          text: 'Since I registered my parking lot in ParkiÜ, I have increased my customers by 30%. The platform is intuitive and easy to use.'
        },
        andres: {
          name: 'Andrés Martínez',
          role: 'Frequent Driver',
          text: 'Reviews and comments help me choose safe parking lots. The updated availability information is invaluable.'
        },
        btn: {
          startLooking: 'Start looking for parking spaces',
        },
      },
      // Traducciones para CTA
      ctaSection:{
        sectionTitle: 'Ready to find your ideal parking space?',
        subtitle: 'Join thousands of drivers already enjoying a stress-free parking experience',
        btn: {
          findNearbyParking: 'Find nearby parking',
          manageParking: 'Manage my parking lot',
        },
      },
      // Traducciones para Expansion
      expansionSection:{
        sectionTitle: 'Find parking in ',
        subtitle: 'We started in Bogota and are expanding to the main cities of the country to offer you the best parking experience wherever you go',
        availableNow : 'Available now',
        comingSoon : 'Coming soon',
        majorCities : 'Major cities',
        potentialDrivers : 'Potential drivers',
      },
      // English translations for SEO
      seo: {
        title: 'ParkiÜ - Find the best parking lot near you | Real-time information',
        description: 'ParkiÜ helps you find available parking lots in real time. Check rates, availability, schedules and reviews of parking lots near your location.',
        keywords: 'parking lots, parking, places to park, parking rates, availability, security',
        ogTitle: 'ParkiÜ - Find the best parking lot near you',
        ogDescription: 'Find available parking lots in real time with information on rates, availability, schedules and reviews.'
      },
      // English translations for location dialog
      locationDialog: {
        title: 'Why do we need your location?',
        description: 'To show you the closest parking lots to your current location and provide you with the best possible experience.',
        privacy: 'We don\'t store your location, we only use it for this search.',
        btn: {
          cancel: 'Cancel',
          allow: 'Allow',
        },
      },
      // English translations for About.jsx
      about: {
        features: {
          locationAlgorithm: {
            title: 'Smart Location',
            description: 'Algorithms that find parking lots based on your location and preferences.'
          },
          realTime: {
            title: 'Real Time',
            description: 'Updated data on availability, rates and schedules.'
          },
          timeSaving: {
            title: 'Time Saving',
            description: 'Reduces search time by up to 70%.'
          },
          community: {
            title: 'Community',
            description: 'Network of users who maintain updated information.'
          },
          security: {
            title: 'Security',
            description: 'Security indices based on verified experiences.'
          },
          predictive: {
            title: 'Predictive Analysis',
            description: 'We anticipate future availability based on historical patterns.'
          }
        },
        mission: {
          title: 'Our Mission',
          quote: 'Simplify the parking experience and contribute to sustainable mobility.',
          vision: {
            title: 'Vision',
            description: 'To be the leading platform in intelligent parking management, creating more efficient cities.'
          },
          values: {
            title: 'Values',
            items: [
              'Constant innovation',
              'Transparency',
              'Community',
              'Positive impact'
            ]
          }
        },
        uniqueness: {
          title: 'What Makes Us Unique',
          description: 'Innovative solutions for a better experience.'
        },
        impact: {
          title: 'Our Impact',
          users: 'Users',
          parkings: 'Parking Lots',
          cities: 'Cities',
          timeSaved: 'Time saved'
        },
        team: {
          title: 'Our Team',
          description: 'Professionals passionate about solving urban problems.',
          members: {
            ana: {
              name: 'Camilo León',
              role: 'CEO & Founder',
              bio: 'Specialist in urban mobility solutions.'
            },
            carlos: {
              name: 'David Bautista',
              role: 'CTO',
              bio: 'Developer specialized in geospatial applications.'
            },
            sofia: {
              name: 'Pedro Castiblanco',
              role: 'Operations Director',
              bio: 'Expert in urban logistics and optimization.'
            }
          }
        },
        cta: {
          title: 'Ready to forget the stress?',
          description: 'Join thousands of users with a hassle-free parking experience.',
          findButton: 'Find Parking',
          registerButton: 'Register my Parking Lot'
        }
      },
      // English translations for the parking page
      parking: {
        loading: 'Searching for nearby parking lots...',
        noResults: 'No parking lots found near {{location}}',
        noResultsDefault: 'No nearby parking lots found',
        resultsFound: 'Parking lots near {{location}}',
        resultsFoundDefault: 'Nearby parking lots',
        oneSpotFound: 'Found {{count}} parking lot in your area',
        multipleSpotFound: 'Found {{count}} parking lots in your area',
        tryDifferentLocation: 'Try a different location or expand your search area'
      },
      adminLanding: {
        hero: {
          sectionTitle: 'Power your parking lot with ',
          titleHighlighted: 'smart technology',
          description: 'Join the most innovative parking network in Colombia and transform the way you manage your business.',
          btn: {
            startNow: 'Start Now',
            scheduleDemo: 'Schedule demo',
          },
          stats:{
            increaseOccupancy: 'Average increase in occupancy',
            managementTime: 'Reduction in management time',
            userSatisfaction: 'User satisfaction',
            technicalSupport: 'Technical support',
          },
        },
        features:{
          title: 'Features designed for your success',
          description: 'Powerful tools that will transform the management of your parking lot',
          items:{
            realtimeAnalytics:{
              title: 'Real-time Analytics',
              description: 'Monitor your parking lot occupancy and performance with instantly updated data.'
            },
            customerManagement:{
              title: 'Customer management',
              description: 'Manage reservations, user profiles and loyalty programs from one place.'
            },
            financialControl:{
              title: 'Financial control',
              description: 'Detailed revenue tracking, automatic invoicing and financial reporting.'
            },
            advancedSecurity:{
              title: 'Advanced security',
              description: 'Integrated access control and security monitoring system.'
            },
          },
        },
        benefits:{
          title: 'Benefits that boost your business',
          description: 'Discover how ParkiÜ can help you optimize your operations and increase your revenue.',
          items:{
            timeSavings:{
              title:'Time savings',
              description:'Automates routine tasks and reduces administrative management time.'
            },
            increasedVisibility:{
              title:'Increased visibility',
              description:'Increase your digital presence and attract more potential customers.'
            },
            mobileManagement:{
              title:'Mobile management',
              description:'Manage your business from anywhere with our mobile app.'
            },
            detailedReports:{
              title:'Detailed reports',
              description:'Get valuable insights with our customized reports.'
            },
          },
        },
        accessControlSystem:{
          title:'Intelligent and simplified management',
          description:'Optimize your daily operations with our intuitive platform. Designed to make your parking lot management more efficient and profitable.',
          items: {
            economicSolution:{
              title:'Economical solution',
              description:'Optimize costs without compromising quality.',
            },
            simplifiedControl:{
              title:'Simplified control',
              description:'Efficient management of your parking lot.',
            },
            remoteAccess:{
              title:'Access from anywhere',
              description:'Manage your business wherever you are.',
            },
          },
          elementsSystem:{
            simplifiedControl: 'Simplified input and output control',
            billingSystem: 'Integrated billing system',
            realtimeReports: 'Real-time reports and statistics',
            tariffManagement: 'Flexible tariff management',
          },
          disclaimer: {
            title: 'Coming soon',
            description: 'We are working on advanced features such as automatic barrier control and sensor integration to give you an even more complete experience.',
          },
          btn: {
            seeAllFeatures: 'See all features',
          }
        },
        cta: {
          title: 'Ready to take your parking to the next level?',
          description: 'Join the most innovative parking network and start seeing results from the first day.',
          btn:{
            registerParking: 'Register my parking lot',
            contactSales: 'Contact sales'
          }
        }
      },
    }
  }
};

// Verifica y establecer el idioma inicial
// Usando un método simplificado que funciona tanto en cliente como servidor
function getInitialLanguage() {
  try {
    // Primero intentamos obtener del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedLang = window.localStorage.getItem('preferredLanguage');
      if (storedLang && ['es', 'en'].includes(storedLang)) {
        return storedLang;
      }
    }

    // Si no hay nada en localStorage, intentamos el navegador
    if (typeof window !== 'undefined' && window.navigator) {
      const browserLang = navigator.language.split('-')[0];
      if (['es', 'en'].includes(browserLang)) {
        return browserLang;
      }
    }
  } catch (error) {
    console.error('Error al determinar idioma inicial:', error);
  }

  // Si todo falla, usamos español
  return 'es';
}

// Determinar si estamos en modo desarrollo
const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development';

// Inicializar i18n
i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Pasar la instancia i18n a react-i18next
  .use(initReactI18next)
  // Inicializar
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage']
    },
    debug: isDevelopment // Facilita la depuración en desarrollo
  });

// Función auxiliar para cambiar el idioma (útil para componentes no-React)
export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng);
};

export default i18n;
