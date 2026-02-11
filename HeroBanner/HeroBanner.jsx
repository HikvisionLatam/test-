import React from 'react';
import InteractiveHero from '../../components/InteractiveHero/InteractiveHero.jsx';
import { Camera, Bell, Lock } from 'lucide-react';
import { Helmet } from "react-helmet";

const IMG_DESKTOP = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1000&q=90";
const IMG_MOBILE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=90";

function HeroBanner() {
    
    const securityPins = [
        {
            x: 75.5,
            y: 35.2,
            label: "Cámara PTZ Exterior",
            description: "Vigilancia 360° con zoom óptico y visión nocturna.",
            icon: <Camera size={18} />,
            link: "#features",
            linkText: "Ver Detalles"
        },
        {
            x: 45.0,
            y: 62.0,
            label: "Sensor de Movimiento",
            description: "Detecta intrusos en el jardín antes de que lleguen a la puerta.",
            icon: <Bell size={18} />,
                        link: "#lock-specs",
            linkText: "Ver Specs"
        },
        {
            x: 20.0,
            y: 50.0,
            label: "Cerradura Inteligente",
            description: "Acceso sin llaves mediante código o biometría.",
            icon: <Lock size={18} />,
            link: "#lock-specs",
            linkText: "Ver Specs"
        }
    ];

    return (
        <main>
            <Helmet>
                <title>Seguridad Profesional</title>
            </Helmet>
            <InteractiveHero
                desktopImage={IMG_DESKTOP}
                mobileImage={IMG_MOBILE}
                badge="Seguridad Profesional"
                title="Seguridad Profesional,"
                subtitle="Simplificada."
                description="Protege lo que más importa con tecnología empresarial adaptada a tu familia. Una sola app para video, alarmas y acceso."
                colorOne="#cdb4db"
                colorTwo="#ffc8dd"
                colorThree="#ffafcc"
                cta1={{ 
                    text: "Ver Soluciones", 
                    link: "#", 
                }}
                cta2={{ 
                    text: "Ver Demo en Vivo", 
                    link: "#",
                }}
                pins={securityPins}
            />
        </main>
    );
}

export default HeroBanner;