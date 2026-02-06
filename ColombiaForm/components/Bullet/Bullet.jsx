import React from "react";

const Bullet = ({ icon, title, description, className = "" }) => {
  const isReactNode = React.isValidElement(icon) || typeof icon === "function";

  return (
    <div className={`max-w-xl p-[1px] rounded-2xl md:rounded-3xl bg-gradient-to-r from-transparent-500/50 via-gray-600 to-white ${className}`}>
      <div className="flex items-center gap-3 md:gap-4 bg-black rounded-[calc(1rem-1px)] md:rounded-[calc(1.5rem-1px)] p-3 md:p-8">
        <div className="flex-shrink-0">
          {isReactNode ? (
            typeof icon === "function" ? React.createElement(icon, { className: "w-4 h-4 md:w-12 md:h-12" }) : icon
          ) : (
            <img src={icon} alt={title} className="w-4 h-4 md:w-12 md:h-12 object-contain" />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="ctc-mdl text-xs md:text-2xl font-bold leading-tight">{title}</h3>
          <p className="text-white text-xs md:text-xl font-medium opacity-90 leading-snug">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Bullet;