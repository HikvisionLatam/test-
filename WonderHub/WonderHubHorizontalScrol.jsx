import HorizontalScroller from "../../components/HorizontalScrollImages/HorizontalScrollerImages";
import { Helmet } from "react-helmet";

const WonderHubHorizontalScroll = () => {
    const totalImages = 22;
    const images = Array.from({ length: totalImages }, (_, i) =>
        `https://pub-797734661fe7468ca3f3e4417f1d7f22.r2.dev/${i + 1}.jpg`
    );

    return (
        <div>
            <Helmet>
                <title>WonderHub</title>
            </Helmet>
            <HorizontalScroller
                images={images}
                text="Desliza hacia la derecha para explorar la guía de venta de WonderHub."
                title="WonderHub"
            />
        </div>
    );
};

export default WonderHubHorizontalScroll;