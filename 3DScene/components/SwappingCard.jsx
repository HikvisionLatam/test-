import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useMobile } from '../hooks/useMobile';
import '../ProductCard.css';

gsap.registerPlugin(Flip);

const SwappingCard = ({ pinData, onClose }) => {
  const containerRef = useRef(null);
  const flipState = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const isMobile = useMobile();

  useEffect(() => {
    setSelectedId(null);
  }, [pinData]);

  const selectedProduct = useMemo(() =>
    pinData.products.find(p => p.id === selectedId),
    [pinData.products, selectedId]);

  const toggleView = (id) => {
    if (!containerRef.current) return;
    const wrapper = containerRef.current;
    flipState.current = Flip.getState(wrapper);
    setSelectedId(id);
  };

  useLayoutEffect(() => {
    if (!flipState.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
        Flip.from(flipState.current, {
          targets: containerRef.current,
          duration: 0.5,
          ease: "power3.inOut",
          simple: true,
          onEnter: (elements) => {
            gsap.fromTo(elements,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.3, delay: 0.1 }
            );
          }
        });
    }, containerRef);

    flipState.current = null;
    return () => ctx.revert();
  }, [selectedId]);

  return (
    <div className="card-scene-container">
      <div
        ref={containerRef}
        className="card-wrapper"
        data-flip-id="wrapper"
        style={{ 
          height: selectedId ? (isMobile ? '60vh' : '600px') : 'auto',
          
          width: selectedId ? '500px' : '400px',
          minHeight: '220px',
          maxWidth: '92vw' 
        }}
      >
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