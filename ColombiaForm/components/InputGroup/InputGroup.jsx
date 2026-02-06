import React from 'react';
import './InputGroup.css';

const InputGroup = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    error,
    required = true,
    multiline = false
}) => {
    const Component = multiline ? 'textarea' : 'input';

    return (
        <div className={`inputGroup ${error ? 'error' : ''}`}>
            <Component
                name={name}
                required={required}
                autoComplete="off"
                value={value}
                onChange={onChange}
                placeholder=" "
            />
            <label htmlFor={name}>{label}</label>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default InputGroup;