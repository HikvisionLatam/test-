import HorizontalScroller from "../../components/HorizontalScrollImages/HorizontalScrollerImages";
import { Helmet } from "react-helmet";

const AcuSeekHorizontalScroll = () => {
    const totalImages = 15;
    const images = Array.from({ length: totalImages }, (_, i) =>
        `https://pub-e8dfc6d008cf460f9e1ccbc53126c812.r2.dev/${i + 1}.jpg`
    );

    return (
        <div>
            <Helmet>
                <title>AcuSeek</title>
            </Helmet>
            <HorizontalScroller
                images={images}
                text="Desliza hacia la derecha para explorar la guía de venta de AcuSeek."
                title="AcuSeek"
            />
        </div>
    );
};

export default AcuSeekHorizontalScroll;