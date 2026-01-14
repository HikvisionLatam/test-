import ImageComparison from '../../components/ImageComparison/ImageComparison';
import { Helmet } from "react-helmet";

const ImageComparasionColorVu = () => {
  return (
    <>
      <Helmet>
        <title>ColorVu 3.0</title>
      </Helmet>
      
      <div className='w-full h-screen flex items-center justify-center p-4'>
        <ImageComparison
          beforeImage="https://pub-c53d20ed77cf4df7897986c4f5a0326f.r2.dev/before.jpg"
          afterImage="https://pub-c53d20ed77cf4df7897986c4f5a0326f.r2.dev/after.jpg"
        />

      </div>
    </>
  );
}

export default ImageComparasionColorVu;