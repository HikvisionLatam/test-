export const eventColorMap = {
    'Open Course': '#f77f00',
    'Certificaciones': '#D20A11',
    'Webinar & Seminarios': '#0077b6',
    'Destacados': '#6a11cb',
    'default': '#6D6E71',
};

export const eventTextColorMap = {
    'Open Course': '#000000',
    'Certificaciones': '#FFFFFF',
    'Webinar & Seminarios': '#FFFFFF',
    'Destacados': '#FFFFFF',
    'default': '#FFFFFF',
};

export const FIXED_COUNTRIES_LIST = [
    "Argentina", "Chile", "Paraguay", "Uruguay", "Bolivia", 
    "Perú", "Ecuador", "Colombia", "Venezuela", "Panamá", 
    "Costa Rica", "Nicaragua", "Honduras", "Guatemala", 
    "El Salvador", "México", "R. Dominicana", "Puerto Rico", "Brasil"
];

export const COUNTRY_META = {
    "Colombia": { name: "Colombia", code: "co" },
    "Mexico": { name: "México", code: "mx" },
    "México": { name: "México", code: "mx" },
    "Peru": { name: "Perú", code: "pe" },
    "Perú": { name: "Perú", code: "pe" },
    "Argentina": { name: "Argentina", code: "ar" },
    "Chile": { name: "Chile", code: "cl" },
    "Bolivia": { name: "Bolivia", code: "bo" },
    "Bolivia, Plurinational State of": { name: "Bolivia", code: "bo" },
    "Venezuela": { name: "Venezuela", code: "ve" },
    "Bolivarian Republic of Venezuela": { name: "Venezuela", code: "ve" },
    "Venezuela, Bolivarian Republic of": { name: "Venezuela", code: "ve" },
    "Ecuador": { name: "Ecuador", code: "ec" },
    "Paraguay": { name: "Paraguay", code: "py" },
    "Uruguay": { name: "Uruguay", code: "uy" },
    "Panama": { name: "Panamá", code: "pa" },
    "Panamá": { name: "Panamá", code: "pa" },
    "Costa Rica": { name: "Costa Rica", code: "cr" },
    "Dominican Republic": { name: "R. Dominicana", code: "do" },
    "Republica Dominicana": { name: "R. Dominicana", code: "do" },
    "R. Dominicana": { name: "R. Dominicana", code: "do" },
    "Guatemala": { name: "Guatemala", code: "gt" },
    "Honduras": { name: "Honduras", code: "hn" },
    "El Salvador": { name: "El Salvador", code: "sv" },
    "Nicaragua": { name: "Nicaragua", code: "ni" },
    "Puerto Rico": { name: "Puerto Rico", code: "pr" },
    "Brazil": { name: "Brasil", code: "br" },
    "Brasil": { name: "Brasil", code: "br" },
    "default": { name: "Otro", code: "un" }
};

export const getCountryData = (originalName) => {
    return COUNTRY_META[originalName] || { name: originalName, code: "un" };
};

export const normalizeCountryName = (rawName) => {
    if (!rawName) return 'Otros';
    
    const lower = rawName.trim().toLowerCase();

    if (lower === 'mexico') return 'México';
    if (lower === 'peru') return 'Perú';
    if (lower === 'panama') return 'Panamá';
    if (lower === 'brazil') return 'Brasil';
    if (lower.includes('dominicana') || lower.includes('dominican')) return 'R. Dominicana';
    if (lower === 'venezuela, bolivarian republic of' || lower.includes('bolivarian')) return 'Venezuela';
    if (lower === 'bolivia, plurinational state of') return 'Bolivia';
    
    const match = FIXED_COUNTRIES_LIST.find(c => c.toLowerCase() === lower);
    if (match) return match;

    if (COUNTRY_META[rawName]) return COUNTRY_META[rawName].name;

    return rawName;
};