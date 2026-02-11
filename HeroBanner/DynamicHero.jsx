// src/pages/HeroBanner/DynamicHero.jsx
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import InteractiveHero from '../../components/InteractiveHero/InteractiveHero';
import { Helmet } from "react-helmet";
import { bannersData } from './data/banners';

function DynamicHero() {
    const { id } = useParams();
    const data = bannersData[id];

    // Si el ID no existe en nuestro archivo, redirigimos al home
    if (!data) return <Navigate to="/" replace />;

    return (
        <main>
            <Helmet>
                <title>{data.title} | Hikvision</title>
            </Helmet>
            <InteractiveHero
                desktopImage={data.images.desktop}
                mobileImage={data.images.mobile}
                title={data.title}
                subtitle={data.subtitle}
                description={data.description}
                colorOne={data.colors.one}
                colorTwo={data.colors.two}
                colorThree={data.colors.three}
                pins={data.pins}
                cta1={{ text: "Saber más", link: "#" }}
            />
        </main>
    );
}

export default DynamicHero;