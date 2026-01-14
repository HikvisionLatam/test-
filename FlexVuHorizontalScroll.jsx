import HorizontalScroller from "../../components/HorizontalScrollImages/HorizontalScrollerImages";
import { Helmet } from "react-helmet";

const FlexVuHorizontalScroll = () => {
    const totalImages = 15;
    const images = Array.from({ length: totalImages }, (_, i) =>
        `https://pub-af8c7269060645a3af22294a08e89478.r2.dev/${i + 1}.jpg`
    );

    return (
        <div>
            <Helmet>
                <title>FlexVu</title>
            </Helmet>
            <HorizontalScroller
                images={images}
                text="Desliza hacia la derecha para explorar."
                title="FlexVu"
            />
        </div>
    );
};

export default FlexVuHorizontalScroll;
