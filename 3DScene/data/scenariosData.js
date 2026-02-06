// X,Y,Z
export const scenarios = [
    {
        id: "oficina", 
        name: "Oficina",
        modelUrl: "/models/isometric_office.glb", 
        pins: [
            {
                id: "pin-control-de-acceso",
                position: [0.59, 1, -0.18], 
                label: "Control de Acceso",
                icon: "https://cdn-icons-png.flaticon.com/512/1792/1792139.png",
                cardGeneral: {
                    title: "Control de Acceso",
                },
                products: [
                    {
                        id: "p1",
                        name: "DS-K1T673TDX-E1",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000173875/正视图 (1).png",
                        detail: { 
                            description: "Ultra Series Face Access Terminal",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "https://www.hikvision.com/en/products/Access-Control-Products/Face-Recognition-Terminals/Ultra-Series/ds-k1t673tdx-e1/" },
                            FunctionalDescription: [
                                { id: 1, text: "7-inch LCD touch screen, 2 Mega pixel wide-angle lens" },
                                { id: 2, text: "Recognition distance: 0.3 to 3 m" },
                                { id: 3, text: "Face recognition duration ＜ 0.2 s/User" },
                                { id: 4, text: "Built-in M1 card, Felica card, and DESfire card reading module" },
                                { id: 5, text: "Face recognition accuracy rate ≥ 99%" },
                                { id: 6, text: "Face mask detection" },
                                { id: 7, text: "100,000 face capacity, 10,000 fingerprint capacity, 500,000 card capacity, and 150,000 event capacity" },
                                { id: 8, text: "Supports ISAPI, ISUP 5.0, TCP/IP (IPv4 and IPv6)" },
                                { id: 9, text: "Supports single person and multiple people (Up to 5 people) recognition" }
                            ]
                        }
                    },
                ]
            },

            {
                id: "pin-escritorio",
                position: [-3.69, 1, -0.06],
                label: "Zona de Trabajo",
                icon: "💻",
                cardGeneral: {
                    title: "Escritorios Ejecutivos",
                    instruction: "Elige el acabado"
                },
                products: [
                    {
                        id: "e1",
                        name: "Madera Roble",
                        thumbnail: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=300&q=80",
                        detail: { description: "Madera maciza con pasacables.", ctaPrimary: { text: "Cotizar" } }
                    },
                    {
                        id: "e2",
                        name: "Blanco Minimalista",
                        thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80",
                        detail: { description: "Superficie mate antirreflejo.", ctaPrimary: { text: "Cotizar" } }
                    }
                ]
            }
        ]
    }
];