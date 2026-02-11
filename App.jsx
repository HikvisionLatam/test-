import React, { useEffect } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


import HikvisionLatamPage from './pages/Tiktok/latam/TikLatam';
import HikvisionMxPage from './pages/Tiktok/mx/TikMx';
import HikvisionBrPage from './pages/Tiktok/br/TikBr';
import Home from './pages/Home/Home';
import AcuSeekHorizontalScroll from './pages/Acuseek/AcuSeekHorizontalScroll';
import FlexVuHorizontalScroll from './pages/FlexVu/FlexVuHorizontalScroll';
import FlexVu3D from './pages/FlexVu/flexVu3D';
import ImageComparasionColorVu from './pages/ColorVu/ImageComparasionColorVu';
import LatamCalendarPage from './pages/Calendar/LatamCalendarPage';
import MxCalendarPage from './pages/Calendar/MexicoCalendarPage';
import ColombiaCalendarPage from './pages/Calendar/ColombiaCalendarPage';
import TimeLine from './pages/Hik-IA/TimeLine';
import TimelineV2Page from './pages/Hik-IA/TimeLinev2';
import AnticorrosionHorizontalScroll from './pages/Anticorrosion/AnticorrosionHorizontalScrol';
import WonderHubHorizontalScroll from './pages/WonderHub/WonderHubHorizontalScrol';
import WonderHub from './pages/WonderHub/Wonderhub';
import BrazilCalendarPage from './pages/Calendar/BrazilCalendarPage';
import LandingMundial from './pages/ColombiaForm/ColombiaForm';
import TestPage from './pages/3DScene/TestPage';
import ScenePage from './pages/3DScene/ScenePage';
import HeroBanner from './pages/HeroBanner/HeroBanner';
import PinLocator from './pages/HeroBanner/utils/PinLocator';


const WonderHubLangWrapper = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['es', 'en', 'pt'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <WonderHub />;
};

function App() {
  useEffect(() => {
    const pa = window.pa || {};

    const urlParams = new URLSearchParams(window.location.search);
    const dynamicSiteId = urlParams.get('pianoSiteId');

    if (dynamicSiteId) {
      if (typeof pa.setConfigurations === 'function') {
        pa.setConfigurations({
          site: parseInt(dynamicSiteId),
          collectDomain: "ctrvgfl.pa-cd.com"
        });
        // console.log(`✅ Piano Analytics inicializado para Site ID: ${dynamicSiteId}`);
      }
    } else {
      console.warn('⚠️ Piano Analytics: No se detectó pianoSiteId en la URL.');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* TIKTOK */}
      <Route path="/tiktok/mx" element={<HikvisionMxPage />} /> {/* DONE-PIANO -- */}
      <Route path="/tiktok/latam" element={<HikvisionLatamPage />} /> {/* DONE-PIANO -- */}
      <Route path="/tiktok/br" element={<HikvisionBrPage />} /> {/* DONE-PIANO */}
      
      {/* PRODUCTOS */}
      <Route path="/acuseek" element={<AcuSeekHorizontalScroll />} /> {/* DONE-PIANO  --*/}
      <Route path="/hik-anticorrosion" element={<AnticorrosionHorizontalScroll />} /> {/* DONE-PIANO -*/}
      <Route path="/flexvu" element={<FlexVuHorizontalScroll />} /> {/* DONE-PIANO --*/}
      <Route path="/flexvu3d" element={<FlexVu3D />} /> {/* DONE-PIANO --*/}
      <Route path="/colorvu" element={<ImageComparasionColorVu />} /> {/* DONE-PIANO --*/}
      <Route path="/wonderhub" element={<WonderHubHorizontalScroll />} /> {/* DONE-PIANO --*/}
      
      {/* CALENDAR */}
      <Route path="/calendar/latam" element={<LatamCalendarPage />} /> {/* DONE-PIANO --*/}
      <Route path="/calendar/mx" element={<MxCalendarPage />} /> {/* DONE-PIANO --*/}
      <Route path="/calendar/co" element={<ColombiaCalendarPage />} /> {/* DONE-PIANO --*/}
      <Route path="/calendar/br" element={<BrazilCalendarPage />} /> {/* DONE-PIANO */}
      
      {/* HIK-IA */}
      <Route path="/hikia/timeline" element={<TimeLine />} />
      <Route path="/hikia/timelinev2" element={<TimelineV2Page />} />
      
      {/* WONDERHUB DEMO */}
      <Route path="/wonderhub/:lang/demo" element={<WonderHubLangWrapper />} /> {/* DONE-PIANO --*/}
      <Route path="/wonderhub/demo" element={<Navigate to="/wonderhub/es/demo" replace />} /> {/* DONE-PIANO --*/}
      
      {/* LANDING MUNDIAL COLOMBIA */}
      <Route path="es-co/mundial" element={<LandingMundial />} />{/* DONE-PIANO --*/}

      {/* TEST-ESCENARIO*/}
      <Route path="/3dscene/test" element={<TestPage />} />
      {/* TEST-ESCENARIO*/}
      <Route path="/smb/experience/:id" element={<ScenePage />} />

      {/* HERO BANNERS */}
      <Route path='/PinLocatorABC1234' element={<PinLocator />} />
      <Route path='/HeroBanner' element={<HeroBanner />} /> {/* DONE-PIANO --*/}


      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;