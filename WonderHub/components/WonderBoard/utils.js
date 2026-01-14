// utils.js
export const generatePath = (type, width, height, aVal = 1, bVal = 0) => {
    const w = width;
    const h = height;
    const midX = w / 2;
    const midY = h / 2;
    
    // Escala: 1 unidad matemática = 40 píxeles
    const scale = 40; 
    
    // Convertir inputs de string a float
    const a = parseFloat(aVal) || 0;
    const b = parseFloat(bVal) || 0;

    const mapX = (screenX) => (screenX - midX) / scale;
    const mapY = (mathY) => midY - (mathY * scale);

    let path = '';

    if (type === 'linear') {
        // y = ax + b
        const y1 = a * mapX(0) + b;
        const y2 = a * mapX(w) + b;
        path = `M 0 ${mapY(y1)} L ${w} ${mapY(y2)}`;
        return path;

    } else if (type === 'quadratic') {
        // y = ax^2 + b
        path = `M 0 ${mapY(a * Math.pow(mapX(0), 2) + b)}`;
        for (let x = 0; x <= w; x += 5) {
            const mathX = mapX(x);
            const mathY = a * Math.pow(mathX, 2) + b;
            path += ` L ${x} ${mapY(mathY)}`;
        }
        return path;

    } else if (type === 'exponential') {
        // y = a * e^(b * x)
        path = `M 0 ${mapY(a * Math.exp(b * mapX(0)))}`;
        for (let x = 0; x <= w; x += 5) {
            const mathX = mapX(x);
            const mathY = a * Math.exp(b * mathX);
            if (mathY > 1e6) break; // Evitar valores demasiado grandes
            path += ` L ${x} ${mapY(mathY)}`;
        }
        return path;

    } else if (type === 'logarithmic') {
        // y = a * ln(x) + b
        // Evitar x <= 0 en el dominio de ln(x)
        const startX = midX + 1; // Empezar a la derecha del origen
        const startMathX = mapX(startX);
        if (startMathX <= 0) return '';
        path = `M ${startX} ${mapY(a * Math.log(startMathX) + b)}`;
        for (let x = startX; x <= w; x += 5) {
            const mathX = mapX(x);
            if (mathX <= 0) continue;
            const mathY = a * Math.log(mathX) + b;
            path += ` L ${x} ${mapY(mathY)}`;
        }
        return path;

    } else if (type === 'rational') {
        // y = a / x + b
        path = '';
        for (let x = 0; x <= w; x += 5) {
            const mathX = mapX(x);
            if (mathX === 0) continue; // Evitar división por cero
            const mathY = a / mathX + b;
            const y = mapY(mathY);
            if (!path) {
                path = `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        }
        return path;

    } else if (type === 'trig') {
        // y = a * sin(x) + b
        path = `M 0 ${mapY(a * Math.sin(mapX(0)) + b)}`;
        for (let x = 0; x <= w; x += 5) {
            const mathX = mapX(x);
            const mathY = a * Math.sin(mathX) + b;
            path += ` L ${x} ${mapY(mathY)}`;
        }
        return path;
    }
    return '';
};
