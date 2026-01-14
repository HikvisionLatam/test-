import { Helmet } from "react-helmet";
import TiktokCarousel from '../../../components/TiktokCarousel/TiktokCarousel';
import videosData from './hikvisionmx_tiktok_videos.json';

const HikvisionMxPage = () => {
    return (
        <>
            <Helmet>
                <title>Hikvision México - TikTok</title>
                <meta name="description" content="Descubre los videos más recientes de Hikvision México en TikTok." />
            </Helmet>
            <TiktokCarousel
                videosData={videosData}
                username="hikvisionmx"
                link="https://www.tiktok.com/@hikvisionmx"
                country="mx"
            />
        </>
    );
};

export default HikvisionMxPage;