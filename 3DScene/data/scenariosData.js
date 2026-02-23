// X, Y, Z
export const scenarios = [
    {
        id: "office",
        name: "Oficina Inteligente",
        modelUrl: "/models/isometric_office-v1.glb",
        pins: [
            // 1. SISTEMAS DE CONFERENCIA
            {
                id: "pin-conferencia",
                position: [-4, 1.5, 3.5],
                label: "Sistemas de Conferencia",
                iconName: "Presentation",
                cardGeneral: {
                    title: "Colaboración Inteligente",
                    description: "Soluciones interactivas que transforman las reuniones en experiencias inmersivas y productivas."
                },
                products: [
                    {
                        id: "conf-1",
                        name: "DS-D5A86RB/B3",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000177202/front_with__cam&mic.png",
                        detail: {
                            description: "Pantalla interactiva 4K de 86 pulgadas con Android 14.0 EDLA y diseño antirreflejos.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Pantalla UHD 4K (3840 × 2160)" },
                                { id: 2, text: "Sistema Android 14 certificado EDLA" },
                                { id: 3, text: "Respuesta rápida: hasta 50 puntos táctiles" },
                                { id: 4, text: "Chip de conmutador de red integrado" },
                                { id: 5, text: "Vidrio templado y control de temperatura inteligente" }
                            ]
                        }
                    },
                    {
                        id: "conf-2",
                        name: "DS-UAC-S1",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000054861/8mic-无线-左侧.png",
                        detail: {
                            description: "Altavoz inalámbrico para conferencias con matriz de 8 micrófonos y sonido 360°.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Matriz de 8 micrófonos con alcance de 5 metros" },
                                { id: 2, text: "Reducción de ruido inteligente y supresión de eco" },
                                { id: 3, text: "Batería de 3700 mAh para 10 horas de uso" },
                                { id: 4, text: "Conexión Bluetooth, USB Dongle y cable USB" },
                                { id: 5, text: "Diseño Plug-and-play sin controladores" }
                            ]
                        }
                    },
                    {
                        id: "conf-3",
                        name: "iDS-UVC-X28",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000158873/VC2遥控器2.png",
                        detail: {
                            description: "Cámara de conferencia inteligente 'All-in-one' con resolución 4K y seguimiento automático.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Resolución 4K con gran angular de 120°" },
                                { id: 2, text: "8 micrófonos integrados y altavoz HD" },
                                { id: 3, text: "Seguimiento automático de orador (Speaker Tracking)" },
                                { id: 4, text: "Obturador de privacidad integrado" },
                                { id: 5, text: "Interfaz USB Tipo-C Plug-and-play" }
                            ]
                        }
                    }
                ]
            },

            // 2. REDES
            {
                id: "pin-redes",
                position: [4, 3, 2],
                label: "Infraestructura de Red",
                iconName: "Wifi",
                cardGeneral: {
                    title: "Conectividad Robusta",
                    description: "Equipos de red de alto rendimiento para mantener tu empresa siempre conectada."
                },
                products: [
                    {
                        id: "net-1",
                        name: "DS-3WR4G12C",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000181585/1.png",
                        detail: {
                            description: "Enrutador inalámbrico AC1200 4G CAT4 de doble banda.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Velocidad 4G: DL 150Mbps / UL 50Mbps" },
                                { id: 2, text: "Wi-Fi Dual-band AC1200 (300Mbps + 867Mbps)" },
                                { id: 3, text: "Soporta LTE CAT.4, FDD LTE, TDD-LTE, WCDMA" },
                                { id: 4, text: "Acceso instantáneo con tarjeta SIM" }
                            ]
                        }
                    },
                    {
                        id: "net-2",
                        name: "DS-3WF0AC-2NT",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000123500/P10正视图.png",
                        detail: {
                            description: "CPE inalámbrico para elevadores 2.4GHz, 300Mbps hasta 100m.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Distancia máxima de 100m para elevadores" },
                                { id: 2, text: "Antena MIMO 2×2, ganancia 8dBi" },
                                { id: 3, text: "Rendimiento de hasta 300Mbps" },
                                { id: 4, text: "Alimentación PoE pasiva" }
                            ]
                        }
                    }
                ]
            },

            // 3. SISTEMA DE ALARMA
            {
                id: "pin-alarma",
                position: [-3, 2, -3],
                label: "Sistema de Alarma",
                iconName: "Bell",
                cardGeneral: {
                    title: "Seguridad AX PRO",
                    description: "Protección contra intrusiones inalámbrica, fiable y fácil de gestionar."
                },
                products: [
                    {
                        id: "alarm-1",
                        name: "DS-PWA96-M-WE",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000018778/MB-236H-P-HIKVISION.png",
                        detail: {
                            description: "Panel de control de alarma inalámbrico AX PRO (96 zonas).",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Soporta hasta 96 zonas y 48 usuarios" },
                                { id: 2, text: "Verificación de video de 7 segundos" },
                                { id: 3, text: "Conectividad TCP/IP, Wi-Fi y GPRS/3G/4G" },
                                { id: 4, text: "Protocolo inalámbrico Tri-X de largo alcance" },
                                { id: 5, text: "Batería de respaldo integrada" }
                            ]
                        }
                    },
                    {
                        id: "alarm-2",
                        name: "DS-PS1-I-WB(B)",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000156739/室内警号-正视图.png",
                        detail: {
                            description: "Sirena interna inalámbrica con sonido potente de 110dB.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Comunicación bidireccional 433 MHz" },
                                { id: 2, text: "3 tipos de sonido: fuego, pánico e intrusión" },
                                { id: 3, text: "Potencia de sonido: 90 a 110 dB" },
                                { id: 4, text: "Duración de batería de 3 años" },
                                { id: 5, text: "Cifrado AES-128" }
                            ]
                        }
                    },
                    {
                        id: "alarm-3",
                        name: "DS-PKF1-WB(B)",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/SM000092535/遥控器3-black.png",
                        detail: {
                            description: "Llavero inalámbrico para armado y desarmado instantáneo.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Funciones de armado presente/ausente" },
                                { id: 2, text: "Botón de bloqueo y desbloqueo" },
                                { id: 3, text: "Configurable remotamente vía App" },
                                { id: 4, text: "Batería fácilmente reemplazable" }
                            ]
                        }
                    }
                ]
            },

            // 4. VIDEO SEGURIDAD
            {
                id: "pin-video",
                position: [-5, 4, 5],
                label: "Video Seguridad",
                iconName: "Cctv",
                cardGeneral: {
                    title: "Vigilancia Avanzada",
                    description: "Cámaras con IA y visión nocturna a color para protección 24/7."
                },
                products: [
                    {
                        id: "vid-1",
                        name: "DS-2CD1B67G3-LIUF",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/SM000104380/筒机92-左侧.png",
                        detail: {
                            description: "Cámara bala fija ColorVu 3.0 de 6 MP con luz híbrida inteligente.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Imagen colorida 24/7 con tecnología ColorVu 3.0" },
                                { id: 2, text: "Detección de movimiento 2.0 (Humanos/Vehículos)" },
                                { id: 3, text: "Luz Híbrida Inteligente: IR + Luz Blanca" },
                                { id: 4, text: "Micrófono incorporado para seguridad de audio" },
                                { id: 5, text: "Protección IP67 contra agua y polvo" }
                            ]
                        }
                    },
                    {
                        id: "vid-2",
                        name: "iDS-2CD7A46G2/P-IZHSY",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/SM000066357/合.png",
                        detail: {
                            description: "Cámara ANPR DeepinView de 4MP para reconocimiento de matrículas.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Reconocimiento de matrículas y atributos de vehículos" },
                                { id: 2, text: "Tecnología DarkFighter 2.0 para baja iluminación" },
                                { id: 3, text: "WDR de 140dB para contraluces fuertes" },
                                { id: 4, text: "Protección antivandálica IK10 y anticorrosión NEMA 4X" },
                                { id: 5, text: "Sensores de vibración y giroscopio integrados" }
                            ]
                        }
                    },
                    {
                        id: "vid-3",
                        name: "DS-2DP8A440IXG1-LEF",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/SM000100845/鹰眼外观图 非雨刷 正面.png",
                        detail: {
                            description: "Cámara Panorámica PanoVu de 16 MP + PTZ óptico 40x.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Vista panorámica de 180° con resolución 16MP" },
                                { id: 2, text: "Zoom óptico 40x para detalles lejanos" },
                                { id: 3, text: "Seguimiento automático de múltiples objetivos" },
                                { id: 4, text: "Visión nocturna IR de hasta 300m" },
                                { id: 5, text: "Tecnología DarkFighter para ultra baja luz" }
                            ]
                        }
                    }
                ]
            },

            // 5. CONTROL DE ACCESO
            {
                id: "pin-control-acceso",
                position: [2.02, 1, -4.70],
                label: "Control de Acceso",
                iconName: "ScanFace",
                cardGeneral: {
                    title: "Acceso Biométrico",
                    description: "Gestión de entradas segura y sin contacto con reconocimiento facial y huella."
                },
                products: [
                    {
                        id: "acc-1",
                        name: "DS-K1T673TDX-E1",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000173875/正视图 (1).png",
                        detail: {
                            description: "Terminal de acceso facial Serie Ultra con pantalla táctil de 7\".",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Pantalla táctil LCD de 7 pulgadas" },
                                { id: 2, text: "Reconocimiento facial < 0.2 s/Usuario" },
                                { id: 3, text: "Precisión de reconocimiento ≥ 99%" },
                                { id: 4, text: "Capacidad: 100,000 rostros, 500,000 tarjetas" },
                                { id: 5, text: "Detección de uso de mascarilla" }
                            ]
                        }
                    },
                    {
                        id: "acc-2",
                        name: "DS-K1T502DBFWX-CE1",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000176855/镜头指纹刷卡-正视图.png",
                        detail: {
                            description: "Terminal profesional de huella y tarjeta para exteriores (IP65/IK09).",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Cámara de 2MP y módulo de huella capacitivo" },
                                { id: 2, text: "Protección IP65 e IK09 antivandálica" },
                                { id: 3, text: "Gestión remota desde App Hik-Connect" },
                                { id: 4, text: "Soporta audio bidireccional y video portero" },
                                { id: 5, text: "Capacidad: 100,000 tarjetas, 10,000 huellas" }
                            ]
                        }
                    },
                    {
                        id: "acc-3",
                        name: "DS-K3GL606WX-WB",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000110981/双通道-刷卡.png",
                        detail: {
                            description: "Barrera de paso rápido (Speed Gate) de alto rendimiento.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Motor sin escobillas de alto rendimiento" },
                                { id: 2, text: "Control anti-seguimiento (Anti-tailgating)" },
                                { id: 3, text: "Paso libre en caso de alarma de incendio" },
                                { id: 4, text: "Ancho de carril: 550mm - 1100mm" },
                                { id: 5, text: "Sensores infrarrojos para seguridad (12 pares)" }
                            ]
                        }
                    }
                ]
            },

            // 6. ADMINISTRACIÓN EN LA NUBE
            {
                id: "pin-cloud",
                position: [3, 1.2, 3],
                label: "Gestión Cloud",
                iconName: "Cloud",
                cardGeneral: {
                    title: "Software y Nube",
                    description: "Plataformas centralizadas para la gestión integral de seguridad."
                },
                products: [
                    {
                        id: "cld-1",
                        name: "HikCentral Mini Cube",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/SM000110260/正面图5.png",
                        detail: {
                            description: "Estación de trabajo 'Todo en uno' con VMS preinstalado.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Integra video, control de acceso, intercom y ANPR" },
                                { id: 2, text: "Hardware: i7, 16GB RAM, 512GB SSD" },
                                { id: 3, text: "Listo para usar: Software licenciado preinstalado" },
                                { id: 4, text: "Ideal para PyMEs: seguridad empresarial a bajo costo" }
                            ]
                        }
                    },
                    {
                        id: "cld-2",
                        name: "Hik-Connect (Intercom)",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000138820/HC6 LOGO.png",
                        detail: {
                            description: "Licencia de servicio en la nube para gestión de intercomunicadores.",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Gestión remota de videoporteros desde la nube" },
                                { id: 2, text: "Llamadas directas a la App Hik-Connect" },
                                { id: 3, text: "Gestión de aperturas temporales y registros" },
                                { id: 4, text: "Ideal para administración de múltiples sitios" }
                            ]
                        }
                    },
                    {
                        id: "cld-3",
                        name: "HikCentral Professional",
                        thumbnail: "https://mps.hikvision.com/mpsPro/picture/M000019527/512logo.png",
                        detail: {
                            description: "Módulo de búsqueda inteligente con lenguaje natural (AcuSeek).",
                            ctaPrimary: { text: "Comprar", url: "https://www.hikvision.com/es-la/all-forms/sales/" },
                            ctaSecondary: { text: "Más información", url: "#" },
                            FunctionalDescription: [
                                { id: 1, text: "Búsqueda unificada de personas y vehículos" },
                                { id: 2, text: "Búsqueda por lenguaje natural impulsada por LLM" },
                                { id: 3, text: "Análisis de atributos de cuerpo y rostro" },
                                { id: 4, text: "Gestión centralizada multi-sitio" }
                            ]
                        }
                    }
                ]
            }
        ]
    }
];