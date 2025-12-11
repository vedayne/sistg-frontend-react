import React, { useState, useEffect, useMemo } from 'react';

interface SeatInfo {
  id: string;
  title: string;
  seat: string;
  directions: string[];
  phones: string[];
  cellphones: string[];
  email: string;
  website: string;
  hours: string;
}

interface MapEmbedUrls {
  [key: string]: string;
}

type SeatType = 'La Paz' | 'Cochabamba' | 'Santa Cruz' | 'Riberalta' | 'Tropico';
type SpecificSeatType = 
  | 'La Paz-Irpavi' 
  | 'La Paz-Central' 
  | 'La Paz-Alto Irpavi'
  | 'Cochabamba-Lanza'
  | 'Cochabamba-Muyurina'
  | 'Santa Cruz'
  | 'Riberalta'
  | 'Tropico';

const SEATS_DATA: SeatInfo[] = [
  {
    id: 'seat-La Paz',
    title: 'LA PAZ',
    seat: 'La Paz',
    directions: ['Av. Rafael Pabón, zona de Irpavi', 'C. Las Retamas, zona Alto Irpavi', 'Av. Arce No. 2642'],
    phones: ['+591 2775536', '+591 2799505'],
    cellphones: ['+591 71223204'],
    email: 'lapaz@adm.emi.edu.bo',
    website: 'emi.edu.bo',
    hours: 'Lun-Vie 08:00 - 16:00'
  },
  {
    id: 'seat-Cochabamba',
    title: 'COCHABAMBA',
    seat: 'Cochabamba',
    directions: ['Av. Lanza entre Oruro y La Paz', 'Av. 23 de Marzo, Zona Muyurina'],
    phones: ['+591 4531133', '+591 4530361'],
    cellphones: ['+591 71522834', '+591 71223204'],
    email: 'cochabamba@adm.emi.edu.bo',
    website: 'emi.edu.bo/cbba',
    hours: 'Lun-Vie 08:00 - 16:00'
  },
  {
    id: 'seat-Santa Cruz',
    title: 'SANTA CRUZ',
    seat: 'Santa Cruz',
    directions: ['Tercer Anillo Radial 13'],
    phones: ['+591 3527431', '+591 3579545'],
    cellphones: ['+591 71566652'],
    email: 'santacruz@adm.emi.edu.bo',
    website: 'emi.edu.bo',
    hours: 'Lun-Vie 08:00 - 16:00'
  },
  {
    id: 'seat-Riberalta',
    title: 'RIBERALTA',
    seat: 'Riberalta',
    directions: ['Nicanor Salvatierra N° 154 - Barrio La Cruz'],
    phones: ['+591 8524373'],
    cellphones: ['+591 71564887'],
    email: 'riberalta@adm.emi.edu.bo',
    website: 'emi.edu.bo',
    hours: 'Lun-Vie 08:00 - 16:00'
  },
  {
    id: 'seat-Tropico',
    title: 'TROPICO',
    seat: 'Tropico',
    directions: ['Calle Germán Bush / OTB Paraíso Distrito N° 9 - Shinahota'],
    phones: [],
    cellphones: ['+591 71291823', '+591 71291829'],
    email: 'tropico@adm.emi.edu.bo',
    website: 'emi.edu.bo',
    hours: 'Lun-Vie 08:00 - 16:00'
  }
];

const MAP_EMBED_URLS: MapEmbedUrls = {
  'Cochabamba-Lanza': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.586100519572!2d-66.15954188552429!3d-17.383638418671957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e3740ee58e3411%3A0xf66ea3b67561c448!2sEscuela%20Militar%20De%20Ingenier%C3%ADa!5e0!3m2!1ses-419!2sbo!4v1630616793551!5m2!1ses-419!2sbo',
  'Cochabamba-Muyurina': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1346.2199137952214!2d-66.14733120880813!3d-17.378887962383587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e37404a8f5dc31%3A0x20561bb4ae20a1e3!2sEscuela%20Militar%20De%20Ingenier%C3%ADa!5e0!3m2!1ses-419!2sbo!4v1630617099718!5m2!1ses-419!2sbo',
  'La Paz-Irpavi': 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15299.302567448838!2d-68.0868217!3d-16.5348978!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x2a399dfb88c485d6!2sEscuela%20Militar%20de%20Ingenier%C3%ADa%20Irpavi!5e0!3m2!1ses-419!2sbo!4v1602100536820!5m2!1ses-419!2sbo',
  'La Paz-Alto Irpavi': 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9097.29353291977!2d-68.08879081546694!3d-16.529088092406433!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x9d8f5de9639909e9!2sEscuela%20Militar%20de%20Ingenier%C3%ADa%20EMI%20ALTO%20IRPAVI!5e0!3m2!1ses-419!2sbo!4v1630437236488!5m2!1ses-419!2sbo',
  'La Paz-Central': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.2926037162197!2d-68.12494398513573!3d-16.51131918860905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f2061cec91d61%3A0xd6b22008c3e21e16!2sEscuela%20Militar%20de%20Ingenier%C3%ADa!5e0!3m2!1ses-419!2sbo!4v1630680192456!5m2!1ses-419!2sbo',
  'Santa Cruz': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3798.571238975043!2d-63.181029885515635!3d-17.811836880537417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e849f01967a3%3A0x6e9f1abefd308f21!2sEMI%20Unidad%20Academica%20Santa%20Cruz!5e0!3m2!1ses-419!2sbo!4v1630617330086!5m2!1ses-419!2sbo',
  'Riberalta': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.5764988753335!2d-66.07611178563326!3d-10.995304326223362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93d41c9459cef1f3%3A0xa4a9de78451a9471!2sEscuela%20Militar%20de%20Ingenieria%20EMI!5e0!3m2!1ses-419!2sbo!4v1630617631789!5m2!1ses-419!2sbo',
  'Tropico': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d974678.8179321924!2d-64.779622099193!3d-17.39550517501707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93e44f47d84c0c1f%3A0x77aafd12ba7fa6ac!2sEMI%20Unidad%20Acad%C3%A9mica%20del%20Tropico!5e0!3m2!1ses-419!2sbo!4v1630617521332!5m2!1ses-419!2sbo'
};

const LA_PAZ_OPTIONS: SpecificSeatType[] = ['La Paz-Irpavi', 'La Paz-Central', 'La Paz-Alto Irpavi'];
const COCHABAMBA_OPTIONS: SpecificSeatType[] = ['Cochabamba-Lanza', 'Cochabamba-Muyurina'];

const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/\s/g, '').replace('+', '');
};

const getDefaultSpecificSeat = (seat: SeatType): SpecificSeatType => {
  if (seat === 'La Paz') return 'La Paz-Central';
  if (seat === 'Cochabamba') return 'Cochabamba-Lanza';
  return seat as SpecificSeatType;
};

const isMultiSeat = (seat: SeatType): boolean => {
  return seat === 'La Paz' || seat === 'Cochabamba';
};

interface SeatButtonProps {
  text: string;
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ text, seat, isSelected, onClick }) => {
  const baseClasses = "px-8 py-3 rounded-lg font-bold neon-border hover:shadow-lg hover:cursor-pointer transition-all";
  const selectedClasses = "bg-gold-400 text-navy-900";
  const unselectedClasses = "bg-navy-800 text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      aria-pressed={isSelected}
    >
      {text}
    </button>
  );
};

interface SpecificSeatButtonProps {
  option: SpecificSeatType;
  isSelected: boolean;
  onClick: () => void;
}

const SpecificSeatButton: React.FC<SpecificSeatButtonProps> = ({ option, isSelected, onClick }) => {
  const baseClasses = "px-8 py-3 rounded-lg font-bold neon-border hover:shadow-lg hover:cursor-pointer transition-all";
  const selectedClasses = "bg-gold-400 text-navy-900";
  const unselectedClasses = "bg-navy-800 text-white";
  const displayText = `Repartición ${option.split('-')[1]}`;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      aria-pressed={isSelected}
    >
      {displayText}
    </button>
  );
};

interface MapIframeProps {
  embedUrl: string;
}

const MapIframe: React.FC<MapIframeProps> = ({ embedUrl }) => {
  return (
    <iframe
      src={embedUrl}
      allowFullScreen
      style={{ border: 0, width: '100%', height: '350px' }}
      title="Mapa EMI"
      loading="lazy"
    />
  );
};

interface InfoCardProps {
  seatInfo: SeatInfo;
  isVisible: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ seatInfo, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="glass neon-border rounded-lg p-6 animate-fade-in">
      <h4 className="text-2xl font-black text-navy-900 mb-4">
        {seatInfo.title}
      </h4>
      <div className="space-y-3 text-sm font-semibold text-slate-700">
        <p>
          📍 {seatInfo.directions.join(' | ')}
        </p>
        
        {seatInfo.phones.length > 0 && (
          <p>
            📞 {seatInfo.phones.join(' | ')}
          </p>
        )}
        
        <p>
          📱 {seatInfo.cellphones.map((cellphone, index) => (
            <React.Fragment key={cellphone}>
              <a
                href={`https://wa.me/${formatPhoneForWhatsApp(cellphone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {cellphone}
              </a>
              {index < seatInfo.cellphones.length - 1 && ' | '}
            </React.Fragment>
          ))}
        </p>
        
        <p>
          <a
            href={`mailto:${seatInfo.email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            📧 {seatInfo.email}
          </a>
        </p>
        
        <p>
          <a
            href={`https://www.${seatInfo.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            🌐 {seatInfo.website}
          </a>
        </p>
        
        <p>
          🕐 {seatInfo.hours}
        </p>
      </div>
    </div>
  );
};

const InteractiveMapSection: React.FC = () => {
  const [selectedSeat, setSelectedSeat] = useState<SeatType>('La Paz');
  const [specificSeat, setSpecificSeat] = useState<SpecificSeatType>('La Paz-Central');

  // Update specific seat when main seat changes
  useEffect(() => {
    const defaultSpecific = getDefaultSpecificSeat(selectedSeat);
    setSpecificSeat(defaultSpecific);
  }, [selectedSeat]);

  // Get specific seat options based on selected seat
  const specificSeatOptions = useMemo((): SpecificSeatType[] => {
    if (selectedSeat === 'La Paz') return LA_PAZ_OPTIONS;
    if (selectedSeat === 'Cochabamba') return COCHABAMBA_OPTIONS;
    return [];
  }, [selectedSeat]);

  // Get current map embed URL
  const currentMapUrl = useMemo((): string => {
    return MAP_EMBED_URLS[specificSeat] || MAP_EMBED_URLS['La Paz-Central'];
  }, [specificSeat]);

  // Get current seat info for display
  const currentSeatInfo = useMemo((): SeatInfo | undefined => {
    return SEATS_DATA.find(seat => seat.seat === selectedSeat);
  }, [selectedSeat]);

  const handleSeatSelect = (seat: SeatType): void => {
    setSelectedSeat(seat);
  };

  const handleSpecificSeatSelect = (specific: SpecificSeatType): void => {
    setSpecificSeat(specific);
  };

  const showSpecificButtons = isMultiSeat(selectedSeat);

  return (
    <section className="py-24 px-4 interactive-map-section">
      <style>{`
        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }

        /* Neon border effect */
        .neon-border {
          border: 2px solid #facc15;
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
        }

        /* Glass morphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Grid background */
        .grid-bg {
          background-image: 
            linear-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 204, 21, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Gold accent */
        .gold-accent {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        }

        /* Navy colors */
        .bg-navy-800 {
          background-color: #1e3a5f;
        }

        .bg-navy-900 {
          background-color: #0a1d45;
        }

        .text-navy-900 {
          color: #0a1d45;
        }

        /* Gold colors */
        .bg-gold-400 {
          background-color: #facc15;
        }

        /* Fade in animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        /* Responsive utilities */
        @media (max-width: 768px) {
          .interactive-map-section .map-container {
            width: 95% !important;
          }
        }
      `}</style>

      <div className="w-full">
        {/* Section Title */}
        <h2 className="text-5xl md:text-6xl font-black text-navy-900 mb-4 text-center">
          UBICACIONES
        </h2>
        <div className="w-24 h-1 gold-accent mx-auto rounded-full mb-16"></div>

        {/* Main Seat Selection Buttons */}
        <div className="flex gap-4 justify-center my-8 flex-wrap">
          {SEATS_DATA.map((seatData) => (
            <SeatButton
              key={seatData.seat}
              text={seatData.title}
              seat={seatData.seat as SeatType}
              isSelected={selectedSeat === seatData.seat}
              onClick={() => handleSeatSelect(seatData.seat as SeatType)}
            />
          ))}
        </div>

        {/* Specific Seat Selection Buttons (for La Paz and Cochabamba) */}
        {showSpecificButtons && (
          <div className="flex justify-center w-full mx-auto gap-4 my-5 flex-wrap">
            {specificSeatOptions.map((option) => (
              <SpecificSeatButton
                key={option}
                option={option}
                isSelected={specificSeat === option}
                onClick={() => handleSpecificSeatSelect(option)}
              />
            ))}
          </div>
        )}

        {/* Map Container */}
        <div className="flex justify-center w-full mx-auto">
          <div className="grid-bg relative rounded-lg overflow-hidden w-full md:w-3/5 mx-auto map-container">
            <MapIframe embedUrl={currentMapUrl} />
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-12 max-w-3xl mx-auto">
          {currentSeatInfo && (
            <InfoCard
              seatInfo={currentSeatInfo}
              isVisible={true}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default InteractiveMapSection;
export type { SeatInfo, SeatType, SpecificSeatType };
