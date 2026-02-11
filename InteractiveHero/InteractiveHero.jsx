import React, { useState } from 'react';
import { X, Play, ChevronRight } from 'lucide-react';
import { trackEvent } from '../../utils/analytics'; 

// --- UTILS ---
const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return 'rgba(0,0,0,0)';
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
  }
  return hex;
};

const sanitizeForAnalytics = (str) => {
  return str 
    ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_') 
    : 'unknown';
};

// --- COMPONENTE PIN ---
const Pin = ({ x, y, data, isActive, onToggle, styles }) => {
  const getPositionClasses = (xPos) => {
    if (xPos < 30) return { box: 'left-0 origin-top-left', arrow: 'left-5' };
    else if (xPos > 70) return { box: 'right-0 origin-top-right', arrow: 'right-5' };
    else return { box: 'left-1/2 -translate-x-1/2 origin-top', arrow: 'left-1/2 -translate-x-1/2' };
  };

  const posClasses = getPositionClasses(x);

  const handlePinInteraction = (e) => {
    if (!isActive) {
      trackEvent('click.action', {
        click_chapter1: 'soluciones_residenciales',
        click_chapter2: 'hero_interactivo',
        click_name: `foco_producto_${sanitizeForAnalytics(data.label)}`
      });
    } 
    else {
      trackEvent('click.action', {
        click_chapter1: 'soluciones_residenciales',
        click_chapter2: 'hero_interactivo',
        click_name: `cerrar_foco_${sanitizeForAnalytics(data.label)}`
      });
    }
    onToggle(e);
  };

  const handleLinkClick = () => {
    trackEvent('click.action', {
      click_chapter1: 'soluciones_residenciales',
      click_chapter2: 'detalle_producto',
      click_name: `ver_caracteristicas_${sanitizeForAnalytics(data.label)}`
    });
  };

  return (
    <div 
      className={`absolute ${isActive ? 'z-50' : 'z-20'}`} 
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {!isActive && (
        <span 
          className="absolute -inset-4 rounded-full animate-ping pointer-events-none"
          style={{ backgroundColor: styles.lightColor }} 
        ></span>
      )}
      
      <button
        onClick={handlePinInteraction}
        className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-transform duration-300 ease-out z-30 hover:scale-110 cursor-pointer"
        style={isActive 
          ? { backgroundColor: '#fff', color: styles.mainColor, boxShadow: `0 10px 25px -5px ${styles.shadowColor}` }
          : { background: styles.bgGradient, color: '#fff', boxShadow: `0 10px 25px -5px ${styles.shadowColor}` }
        }
        aria-label={data.label}
      >
        {isActive ? <X size={20} /> : data.icon}
      </button>

      <div className={`absolute mt-4 w-[280px] sm:w-[320px] bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 z-40 ${posClasses.box} ${isActive ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}`}>
        <div className={`absolute -top-2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 ${posClasses.arrow}`}></div>
        
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: styles.lightColor, color: styles.mainColor }}
            >
              {data.icon}
            </div>
            <h3 className="text-slate-900 font-bold text-lg leading-tight font-gilroy">{data.label}</h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-4 font-medium">{data.description}</p>
          
          {data.link && (
            <a 
              href={data.link} 
              onClick={handleLinkClick}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{ color: styles.mainColor }}
            >
              {data.linkText || "Ver Características"} 
              <ChevronRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const InteractiveHero = ({ 
  desktopImage, 
  mobileImage, 
  pins = [], 
  title, 
  subtitle, 
  description,
  colorOne = "#D32F2F", 
  colorTwo, 
  colorThree, 
  cta1,
  cta2
}) => {
  const [activePinIndex, setActivePinIndex] = useState(null);

  const bgGradient = colorTwo 
    ? `linear-gradient(135deg, ${colorOne} 0%, ${colorTwo} ${colorThree ? '50%' : '100%'} ${colorThree ? `, ${colorThree} 100%` : ''})`
    : colorOne;

  const dynamicStyles = {
    bgGradient: bgGradient,
    mainColor: colorOne,
    lightColor: hexToRgba(colorOne, 0.1),
    shadowColor: hexToRgba(colorOne, 0.4),
    textGradientStyle: colorTwo ? {
      backgroundImage: bgGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent'
    } : { color: colorOne }
  };

  const handleBackgroundClick = (e) => {
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      if (activePinIndex !== null) {
        const closedPinLabel = pins[activePinIndex].label;
        trackEvent('click.action', {
          click_chapter1: 'soluciones_residenciales',
          click_chapter2: 'hero_interactivo',
          click_name: `cerrar_foco_background_${sanitizeForAnalytics(closedPinLabel)}`
        });
      }
      setActivePinIndex(null);
    }
  };

  const trackMainCTA = (actionName) => {
    trackEvent('click.action', {
      click_chapter1: 'soluciones_residenciales',
      click_chapter2: 'navegacion_hero',
      click_name: actionName
    });
  };

  return (
    <section 
      className="relative w-full h-full bg-white font-gilroy overflow-y-auto overflow-x-hidden" 
      onClick={handleBackgroundClick}
    >
      <div className="w-full min-h-full flex flex-col lg:flex-row">
        
        <div className="w-full lg:w-[45%] xl:w-[40%] flex-shrink-0 flex flex-col justify-center px-6 py-8 lg:py-12 lg:pl-16 relative z-10">
          <div className="max-w-xl mx-auto lg:mx-0">
            <span 
              className="inline-block py-1.5 px-4 rounded-full text-xs font-extrabold tracking-widest uppercase mb-4 lg:mb-6"
              style={{ backgroundColor: dynamicStyles.lightColor, color: dynamicStyles.mainColor }}
            >
              Soluciones Residenciales
            </span>
            
            <h1 className="text-[32px] sm:text-[40px] lg:text-[64px] leading-[1.1] font-extrabold text-slate-900 tracking-tight mb-4 lg:mb-6">
              {title} <br />
              <span style={dynamicStyles.textGradientStyle}>{subtitle}</span>
            </h1>
            
            <p className="text-base lg:text-lg text-slate-500 leading-relaxed mb-6 lg:mb-10 max-w-lg font-medium">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {cta1 && (
                <a 
                  href={cta1.link || '#'}
                  onClick={() => trackMainCTA(`cta_primary_${sanitizeForAnalytics(cta1.text)}`)}
                  className="flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-white rounded-xl font-bold text-sm lg:text-base transition-transform active:scale-95 hover:shadow-lg cursor-pointer"
                  style={{ 
                    background: cta1.colorbg || dynamicStyles.bgGradient, 
                    boxShadow: `0 4px 14px 0 ${hexToRgba(cta1.colorbg || colorOne, 0.3)}` 
                  }}
                >
                  {cta1.text}
                </a>
              )}
              
              {cta2 && (
                <a 
                  href={cta2.link || '#'}
                  onClick={() => trackMainCTA(`cta_secondary_${sanitizeForAnalytics(cta2.text)}`)}
                  className="flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-bold text-sm lg:text-base transition-colors gap-2 hover:brightness-95 cursor-pointer"
                  style={{ 
                    backgroundColor: cta2.colorbg ? hexToRgba(cta2.colorbg, 0.1) : dynamicStyles.lightColor, 
                    color: cta2.colorbg || dynamicStyles.mainColor 
                  }}
                >
                  <Play size={18} className="fill-current" />
                  {cta2.text}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-[450px] shrink-0 lg:h-auto lg:flex-1 relative min-h-0 bg-gray-100 overflow-hidden">
          
          <div className="absolute inset-0 w-full h-full">
            <picture>
              <source media="(max-width: 1023px)" srcSet={mobileImage} type="image/webp" />
              <source media="(min-width: 1024px)" srcSet={desktopImage} type="image/webp" />
              <img src={desktopImage} alt="Hero Interactive" className="w-full h-full object-cover object-center" />
            </picture>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent w-full lg:w-2/3 hidden lg:block pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:hidden pointer-events-none"></div>

          <div className="absolute inset-0 w-full h-full">
            {pins.map((pin, idx) => (
              <Pin 
                key={idx}
                x={pin.x}
                y={pin.y}
                data={pin}
                styles={dynamicStyles}
                isActive={activePinIndex === idx}
                onToggle={(e) => {
                  e.stopPropagation();
                  setActivePinIndex(activePinIndex === idx ? null : idx);
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default InteractiveHero;