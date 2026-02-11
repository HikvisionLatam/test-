import { createElement } from 'react';
import { Camera, Lock, Cpu } from 'lucide-react';

export const bannersData = {
    "seguridad-hogar": {
        title: "Seguridad Profesional",
        subtitle: "Simplificada.",
        description: "Protege lo que más importa con tecnología adaptada a tu familia.",
        colors: { one: "#cdb4db", two: "#ffc8dd", three: "#ffafcc" },
        images: {
            desktop: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
            mobile: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
        },
        pins: [
            { x: 75.5, y: 35.2, label: "Cámara PTZ", icon: createElement(Camera, { size: 18 }), link: "#", linkText: "Ver más" },
            { x: 20.0, y: 50.0, label: "Cerradura", icon: createElement(Lock, { size: 18 }), link: "#", linkText: "Specs" }
        ]
    },
    "industria-ia": {
        title: "Inteligencia Artificial",
        subtitle: "En tu empresa.",
        description: "Optimiza procesos con analíticas avanzadas de video.",
        colors: { one: "#003049", two: "#669bbc", three: null },
        images: {
            desktop: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
            mobile: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800"
        },
        pins: [
            { x: 50.0, y: 40.0, label: "Sensor IA", icon: createElement(Cpu, { size: 18 }), link: "#" }
        ]
    }
};  