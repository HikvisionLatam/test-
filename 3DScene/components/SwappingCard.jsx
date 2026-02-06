import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import '../ProductCard.css';

gsap.registerPlugin(Flip);

const SwappingCard = ({ pinData, onClose }) => {
  const containerRef = useRef(null);
  const flipState = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  // 1. Efecto para resetear la vista cuando cambias de pin en el mapa
  useEffect(() => {
    // Si el usuario pulsa un pin diferente, volvemos a la vista de lista
    setSelectedId(null);
  }, [pinData]); // Se ejecuta cada vez que pinData cambia

  const selectedProduct = useMemo(() =>
    pinData.products.find(p => p.id === selectedId),
    [pinData.products, selectedId]);

  const toggleView = (id) => {
    if (!containerRef.current) return;

    const wrapper = containerRef.current;
    // Capturamos el estado actual antes de que React cambie el DOM
    flipState.current = Flip.getState(wrapper);
    setSelectedId(id);
  };

  useLayoutEffect(() => {
    if (!flipState.current || !containerRef.current) return;

    // Ejecutamos la transición suave
    Flip.from(flipState.current, {
      targets: containerRef.current,
      duration: 0.4,
      ease: "power2.inOut",
      simple: true,
      onEnter: (elements) => {
        // Animación de entrada para el nuevo contenido
        gsap.fromTo(elements,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.1 }
        );
      }
    });

    flipState.current = null;
  }, [selectedId]);

  return (
    <div className="card-scene-container">
      <div
        ref={containerRef}
        className="card-wrapper"
        data-flip-id="wrapper"
        style={{ 
          width: selectedId ? '390px' : '360px',
          height: selectedId ? '600px' : 'auto',
          minHeight: '200px' // Evita que colapse visualmente
        }}
      >
        {/* VISTA DE LISTA (General) */}
        {!selectedId && (
          <div className="grid-content">
            <div className='flex justify-between mb-6'>
              <h1 className="text-xl font-bold">{pinData.cardGeneral.title}</h1>
              <button className="close-btn-grid" onClick={onClose} title="Cerrar tarjeta">
                ✕
              </button>
            </div>
            <div className="thumbs-row">
              {pinData.products.map((prod) => (
                <div key={prod.id} className="thumb-item" onClick={() => toggleView(prod.id)}>
                  <img src={prod.thumbnail} alt={prod.name} className="thumb-img" />
                  <div className="thumb-label">{prod.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA DE DETALLE */}
        {selectedId && selectedProduct && (
          <div className="detail-content">
            <div className='flex items-center justify-start gap-4 p-4 border-b-[1px] border-gray-200'>
              <button className="close-btn-grid" onClick={() => toggleView(null)} title="Volver al listado">
                ←
              </button>
            </div>
            <div className="scroll-content-inner">
              <div className="hero-section">
                <img 
                  src={selectedProduct.detail.largeImage || selectedProduct.thumbnail} 
                  alt={selectedProduct.name} 
                  className="hero-img-detail"
                />
              </div>

              <div className="text-section">
                <div className='mb-6'>
                  <h2 className='font-bold m-0 text-xl'>{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.detail.description}</p>
                </div>
                
                {Array.isArray(selectedProduct.detail.FunctionalDescription) && (
                  <ul className="list-disc list-inside my-4 text-sm text-gray-600">
                    {selectedProduct.detail.FunctionalDescription.map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {selectedProduct.detail.ctaPrimary && (
              <div className="action-footer">
                <div className="btns-row">
                  <a href={selectedProduct.detail.ctaSecondary.url} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                    {selectedProduct.detail.ctaSecondary.text}
                  </a>
                  <a href={selectedProduct.detail.ctaPrimary.url} className="btn-primary" target="_blank" rel="noopener noreferrer">
                    {selectedProduct.detail.ctaPrimary.text}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwappingCard;