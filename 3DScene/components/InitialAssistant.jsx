import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const InitialAssistant = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => setIsVisible(false), 400);
    };

    if (!isVisible) return null;

    return (
        <div className={`hik-assistant-overlay ${isExiting ? 'fade-out' : ''}`}>
            <div className="hik-assistant-card">
                
                <div className="hik-assistant-icon-wrap">
                    <ShieldCheck size={36} color="white" strokeWidth={2} />
                </div>
                
                <h2 className="hik-assistant-title">Descubre nuestras soluciones</h2>
                
                <p className="hik-assistant-text">
                    Navega por el escenario 3D para conocer la tecnología que protege tu entorno. 
                    <br/><br/>
                    Da clic en los <strong>pines interactivos</strong> para explorar los productos y detalles técnicos.
                </p>
                
                <button className="hik-assistant-btn" onClick={handleDismiss}>
                    Comenzar a explorar
                </button>
            </div>

            <style jsx>{`
                .hik-assistant-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.65);
                    backdrop-filter: blur(6px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 200;
                    transition: opacity 0.4s ease;
                    padding: 20px;
                }
                .hik-assistant-overlay.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }
                .hik-assistant-card {
                    background: white;
                    padding: 40px 30px;
                    border-radius: 24px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                    max-width: 420px;
                    text-align: center;
                    border: 1px solid #f0f0f0;
                    animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .hik-assistant-icon-wrap {
                    width: 64px;
                    height: 64px;
                    background: #d01c19;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                    box-shadow: 0 8px 20px rgba(208, 28, 25, 0.3);
                }
                .hik-assistant-title {
                    font-family: 'Inter', sans-serif;
                    font-size: 22px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin-bottom: 16px;
                    margin-top: 0;
                }
                .hik-assistant-text {
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .hik-assistant-btn {
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                }
                .hik-assistant-btn:hover {
                    background: #d01c19;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(208, 28, 25, 0.2);
                }
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default InitialAssistant;