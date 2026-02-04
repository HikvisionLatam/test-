// src/components/calendarConstants.js

export const eventColorMap = {
    'Open Course': '#f77f00',
    'Certificaciones': '#D20A11',
    'Webinar & Seminarios': '#0077b6',
    'default': '#6D6E71',
};

export const eventTextColorMap = {
    'Open Course': '#000000',
    'Certificaciones': '#FFFFFF',
    'Webinar & Seminarios': '#FFFFFF',
    'default': '#FFFFFF',
};

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
    "Costa Rica": { name: "Costa Rica", code: "cr" },
    "Dominican Republic": { name: "R. Dominicana", code: "do" },
    "Republica Dominicana": { name: "R. Dominicana", code: "do" },
    "Guatemala": { name: "Guatemala", code: "gt" },
    "Honduras": { name: "Honduras", code: "hn" },
    "El Salvador": { name: "El Salvador", code: "sv" },
    "Nicaragua": { name: "Nicaragua", code: "ni" },
    "Brazil": { name: "Brasil", code: "br" },
    "Brasil": { name: "Brasil", code: "br" },
    "default": { name: "Otro", code: "un" }
};

export const getCountryData = (originalName) => {
    return COUNTRY_META[originalName] || { name: originalName, code: "un" };
};