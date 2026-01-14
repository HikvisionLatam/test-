import { Helmet } from "react-helmet";
import TiktokCarousel from '../../../components/TiktokCarousel/TiktokCarousel';
import videosData from './hikvisionbr_tiktok_videos.json';

const HikvisionBrPage  = () => {
    return (
        <>
            <Helmet>
                <title>Hikvision Brasil - TikTok</title>
                <meta name="description" content="Descubra os vídeos mais recentes da Hikvision Brasil no TikTok." />
            </Helmet>
            <TiktokCarousel
                videosData={videosData}
                username="hikvisionbr"
                link="https://www.tiktok.com/@hikvisionbr"
                country="br"
            />
        </>
    );
};

export default HikvisionBrPage;