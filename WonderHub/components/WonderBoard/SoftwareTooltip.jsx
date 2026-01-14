// SoftwareTooltip.jsx
import React from 'react';

const SoftwareTooltip = ({ label, children }) => {
    return (
        <div className="relative group/tooltip flex flex-col items-center justify-center">
            {children}
            <div className="absolute -top-10 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 transform translate-y-2 group-hover/tooltip:translate-y-0 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md shadow-xl pointer-events-none whitespace-nowrap z-[9999] border border-white/10">
                {label}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
        </div>
    );
};

export default SoftwareTooltip;