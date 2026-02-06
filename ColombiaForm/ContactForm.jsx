import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import InputGroup from './components/InputGroup/InputGroup';
import { trackEvent } from '../../utils/analytics'; 

const ContactForm = () => {
    const [formData, setFormData] = useState({
        fullName: '', company: '', phone: '', email: '', project: ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle');
    const successAudioRef = useRef(null);

    if (!successAudioRef.current && typeof Audio !== "undefined") {
        successAudioRef.current = new Audio("https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3");
    }

    const validateForm = () => {
        const newErrors = {};
        const phoneRegex = /^[0-9]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.fullName.trim()) newErrors.fullName = 'El nombre es obligatorio';
        if (!formData.company.trim()) newErrors.company = 'La empresa es obligatoria';
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es obligatorio';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'El teléfono solo debe contener números';
        } else if (formData.phone.length < 7) {
            newErrors.phone = 'El número parece muy corto';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Introduce un email válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const triggerSuccessEffect = () => {
        try {
            if(successAudioRef.current) {
                successAudioRef.current.volume = 0.5;
                successAudioRef.current.currentTime = 0;
                successAudioRef.current.play().catch(e => {});
            }
        } catch (error) {}

        const duration = 2500;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 4, angle: 60, spread: 55, origin: { x: 0 },
                colors: ['#ff2e57', '#ffffff', '#FFD700'], disableForReducedMotion: true
            });
            confetti({
                particleCount: 4, angle: 120, spread: 55, origin: { x: 1 },
                colors: ['#ff2e57', '#ffffff', '#FFD700'], disableForReducedMotion: true
            });

            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setStatus('loading');

        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxc0mC_6525JZWaM39VtZEFaMDfCcpCrLop1kP-Onah1GSIKfYPuMzJ9S5Q_77-cYv7/exec"; 

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData)
            });

            setStatus('success');
            
            trackEvent('click.navigation', {
                click_chapter1: 'envio_formulario_contacto_mundialCO',
                click_chapter2: 'success',
            });

            setFormData({ fullName: '', company: '', phone: '', email: '', project: '' });
            triggerSuccessEffect();

        } catch (err) {
            console.error("Error:", err);
            setStatus('error');
            
            trackEvent('click.navigation', {
                click_chapter1: 'envio_formulario_contacto_mundialCO',
                click_chapter2: 'error',
            });
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md mx-auto mt-10 animate-fade-in border border-gray-100">
                <div className="text-6xl mb-4 animate-bounce" role="img" aria-label="Icono de celebración">✨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Mensaje Enviado!</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                    Gracias por contactarnos. Hemos recibido tu información correctamente.
                </p>
                <button 
                    onClick={() => setStatus('idle')} 
                    className="cursor-pointer mt-8 px-6 py-2 rounded-full border border-[#ff2e57] text-[#ff2e57] font-bold hover:bg-[#ff2e57] hover:text-white transition-colors duration-300"
                >
                    Volver al formulario
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-2xl mt-10 border border-white/50">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Hablemos de tu Proyecto</h2>
            <p className="text-center text-gray-500 mb-8">Déjanos tus datos y construyamos algo increíble.</p>
            
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup 
                        label="Nombre Completo *" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        error={errors.fullName}
                        required 
                    />
                    <InputGroup 
                        label="Empresa *" 
                        name="company" 
                        value={formData.company} 
                        onChange={handleChange} 
                        error={errors.company}
                        required 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup 
                        label="Teléfono *" 
                        name="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        error={errors.phone}
                        required 
                    />
                    <InputGroup 
                        label="E-mail *" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        error={errors.email}
                        required 
                    />
                </div>
                <div className="relative mt-4">
                    <label htmlFor="project" className="block text-gray-500 font-medium mb-1 text-sm pl-2">Coméntanos brevemente tu proyecto *</label>
                    <InputGroup 
                        name="project" 
                        multiline 
                        value={formData.project} 
                        onChange={handleChange} 
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`cursor-pointer w-full mt-6 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-95 shadow-lg
                        ${status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff2e57] hover:bg-[#e1254a] text-white shadow-[#ff2e57]/30'}`}
                >
                    {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
                
                {status === 'error' && (
                    <p className="text-center text-red-500 mt-4 text-sm" role="alert">Hubo un pequeño problema al enviar. Por favor intenta de nuevo.</p>
                )}
            </form>
        </div>
    );
};

export default ContactForm;