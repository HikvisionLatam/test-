import HorizontalScroller from "../../components/HorizontalScrollImages/HorizontalScrollerImages";
import { Helmet } from "react-helmet";

const AnticorrosionHorizontalScroll = () => {
    const totalImages = 20;
    const images = Array.from({ length: totalImages }, (_, i) =>
        `https://pub-9f72187eb7c04e308e500e7106ea10d7.r2.dev/${i + 1}.jpg`
    );

    return (
        <div>
            <Helmet>
                <title>Hik-Anticorrosión</title>
            </Helmet>
            <HorizontalScroller
                images={images}
                text="Desliza hacia la derecha para explorar la guía de venta de Hik-Anticorrosión."
                title="Hik-Anticorrosión"
            />
        </div>
    );
};

export default AnticorrosionHorizontalScroll;