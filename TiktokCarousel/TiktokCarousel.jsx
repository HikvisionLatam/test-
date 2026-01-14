import { useState, useEffect, useRef, useMemo } from 'react';
import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "./tiktok.css";
import { Helmet } from "react-helmet";

const TiktokCarousel = ({ videosData, username, link, country }) => {
    const [videos, setVideos] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRefs = useRef([]);
    const splideRef = useRef(null);
    const autoplayRef = useRef(null);
    const [mutedStates, setMutedStates] = useState({});
    const [playingStates, setPlayingStates] = useState({});
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isCarouselHovered, setIsCarouselHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const lang = useMemo(() => {
        const c = String(country || '').toLowerCase();
        if (c.startsWith('br')) return 'pt';
        const esCountries = ['es','mx','ar','co','pe','cl','uy','ve','ec','bo','py','do','cr','pa','gt','hn','sv','ni','pr'];
        if (esCountries.includes(c)) return 'es';
        return 'en';
    }, [country]);

    const i18n = useMemo(() => ({
        en: {
            pageTitle: (u) => (u ? `${u} TikTok` : "TikTok"),
            watchVideoOnTiktok: "Watch video on TikTok",
            watchVideoOfOnTiktok: (desc) => `Watch video of ${desc} on TikTok.`,
            views: "Views",
            comments: "Comments",
            likes: "Likes",
            viewsCount: (n) => `${n} views`,
            commentsCount: (n) => `${n} comments`,
            likesCount: (n) => `${n} likes`,
            play: "Play video",
            pause: "Pause video",
            enableSound: "Turn on video sound",
            mute: "Mute video",
            seeOnTiktok: "See on TikTok",
            exploreMore: "Explore more content on TikTok",
            exploreMoreTitle: "Hikvision LATAM TikTok",
        },
        pt: {
            pageTitle: (u) => (u ? `${u} TikTok` : "TikTok"),
            watchVideoOnTiktok: "Ver vídeo no TikTok",
            watchVideoOfOnTiktok: (desc) => `Ver vídeo de ${desc} no TikTok.`,
            views: "Visualizações",
            comments: "Comentários",
            likes: "Curtidas",
            viewsCount: (n) => `${n} visualizações`,
            commentsCount: (n) => `${n} comentários`,
            likesCount: (n) => `${n} curtidas`,
            play: "Reproduzir vídeo",
            pause: "Pausar vídeo",
            enableSound: "Ativar som do vídeo",
            mute: "Silenciar vídeo",
            seeOnTiktok: "Ver no TikTok",
            exploreMore: "Explorar mais conteúdo no TikTok",
            exploreMoreTitle: "TikTok Hikvision LATAM",
        },
        es: {
            pageTitle: (u) => (u ? `${u} TikTok` : "TikTok"),
            watchVideoOnTiktok: "Ver vídeo en TikTok",
            watchVideoOfOnTiktok: (desc) => `Ver vídeo de ${desc} en TikTok.`,
            views: "Visualizaciones",
            comments: "Comentarios",
            likes: "Me gusta",
            viewsCount: (n) => `${n} visualizaciones`,
            commentsCount: (n) => `${n} comentarios`,
            likesCount: (n) => `${n} me gusta`,
            play: "Reproducir vídeo",
            pause: "Pausar vídeo",
            enableSound: "Activar sonido del vídeo",
            mute: "Silenciar vídeo",
            seeOnTiktok: "Ver en TikTok",
            exploreMore: "Explora más contenido en TikTok",
            exploreMoreTitle: "Hikvision LATAM TikTok",
        }
    }), []);

    const t = (key, ...args) => {
        const dict = i18n[lang] || i18n.en;
        const val = dict[key];
        return typeof val === "function" ? val(...args) : (val ?? key);
    };

    useEffect(() => {
        if (videosData && videosData.length > 0) {
            const processed = videosData.filter(v => v.video_url);
            setVideos(processed);
        } else {
            setVideos([]);
        }
    }, [videosData]);

    useEffect(() => {
        if (videos.length > 0) {
            const initialMuted = {};
            const initialPlaying = {};
            videos.forEach((_, idx) => {
                initialMuted[idx] = true;
                initialPlaying[idx] = false;
            });
            setMutedStates(initialMuted);
            setPlayingStates(initialPlaying);
        }
    }, [videos]);

    useEffect(() => {
        videoRefs.current.forEach((video, idx) => {
            if (video) {
                video.muted = mutedStates[idx] !== false;
                if (playingStates[idx]) {
                    video.play().catch(error => {
                        console.error("Error al intentar reproducir el video:", error);
                    });
                } else {
                    video.pause();
                }
            }
        });
    }, [mutedStates, playingStates, activeIndex, videos]);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const sendTikTokEvent = (action, video) => {
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: 'Tiktok',
                event_label: video.description,
                value: video.url
            });
        }
    };

    const handleToggleMute = (idx) => {
        setMutedStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
        if (videos[idx]) sendTikTokEvent('toggle_mute', videos[idx]);
    };

    const handlePlayPause = (idx) => {
        setPlayingStates((prev) => {
            const newStates = {};
            Object.keys(prev).forEach((key) => {
                newStates[key] = Number(key) === idx ? !prev[idx] : false;
            });
            return newStates;
        });
        setActiveIndex(idx);

        setMutedStates((prev) => ({
            ...prev,
            [idx]: playingStates[idx] ? true : false,
        }));

        if (videos[idx]) sendTikTokEvent('play_pause', videos[idx]);
    };

    const handleVideoEnded = (idx) => {
        setPlayingStates((prev) => ({ ...prev, [idx]: false }));
        setMutedStates((prev) => ({ ...prev, [idx]: true }));
    };

    const handleVideoClick = (idx) => {
        setHoveredIndex(idx);
        setTimeout(() => setHoveredIndex(null), 2000);
    };

    return (
        <>
            <Helmet>
                <title>{t('pageTitle', username)}</title>
            </Helmet>

            <div className="container mx-auto flex flex-col items-center justify-center min-h-screen max-w-7xl">
                <div className="w-full flex justify-center">
                    <div
                        onMouseEnter={() => setIsCarouselHovered(true)}
                        onMouseLeave={() => setIsCarouselHovered(false)}
                        className="w-full"
                        style={{ maxWidth: 1200 }}
                    >
                        <Splide
                            ref={splideRef}
                            options={{
                                type: 'slide',
                                perPage: 4,
                                focus: 'center',
                                gap: '1rem',
                                padding: { left: '0px', right: '10%' },
                                arrows: true,
                                pagination: false,
                                autoplay: false,
                                rewind: true,
                                height: 'auto',
                                dragMinThreshold: { mouse: 120, touch: 80 },
                                speed: 600,
                                flickPower: 100,
                                flickMaxPages: 1,
                                breakpoints: {
                                    1200: { perPage: 3 },
                                    768: { perPage: 1 }
                                }
                            }}
                            onMoved={(_, newIndex) => setActiveIndex(newIndex)}
                        >
                            {videos.map((video, idx) => (
                                <SplideSlide key={video.url || idx}>
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center text-center video-container no-underline text-inherit"
                                        style={{ transition: 'transform 0.4s' }}
                                        tabIndex={-1}
                                        aria-label={`${t('watchVideoOfOnTiktok', video.description)} ${t('views')}: ${video.views}, ${t('comments')}: ${video.comments}`}
                                        title={t('watchVideoOnTiktok')}
                                        onClick={() => sendTikTokEvent('click_video_link', video)}
                                    >
                                        <div
                                            className='innerVideo'
                                            onMouseEnter={() => setHoveredIndex(idx)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <video
                                                ref={el => (videoRefs.current[idx] = el)}
                                                src={video.video_url}
                                                poster={video.thumbnail_url}
                                                loading={idx < 4 ? "eager" : "lazy"}
                                                muted={mutedStates[idx] !== false}
                                                playsInline
                                                controls={false}
                                                onEnded={() => handleVideoEnded(idx)}
                                                onClick={() => handleVideoClick(idx)}
                                            />

                                            <button
                                                className={`cursor-pointer btn btn-playpause-overlay${(hoveredIndex === idx) ? ' visible' : ''}`}
                                                onMouseUp={e => e.currentTarget.blur()}
                                                onClick={e => { e.preventDefault(); handlePlayPause(idx); }}
                                                type="button"
                                                aria-label={playingStates[idx] ? t('pause') : t('play')}
                                            >
                                                <i className={`fa-solid ${playingStates[idx] ? 'fa-pause' : 'fa-play'}`}></i>
                                            </button>

                                            <div className='contentBottom'>
                                                <div />
                                                <div />
                                                <div />
                                                <div className='head'>
                                                    <div className='flex items-center'>
                                                        <h1 className='text-base text-white mr-1 my-0 font-figtree font-bold'>
                                                            {username || "Hikvisionlatam"}
                                                        </h1>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#42A5F5" className="bi bi-patch-check-fill" viewBox="0 0 16 16">
                                                            <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                                                        </svg>
                                                    </div>

                                                    <p className='text-suspensory-2lines flex-1'>{video.description}</p>

                                                    <div className='flex mt-1 w-full'>
                                                        <div className='w-1/3 flex flex-col justify-center items-center'>
                                                            <i className="fa-solid fa-eye" aria-hidden="true"></i>
                                                            <p className='font-bold' aria-label={t('viewsCount', video.views)}>{video.views}</p>
                                                        </div>

                                                        <div className='w-1/3 border-l border-r border-white flex flex-col justify-center items-center'>
                                                            <i className="fa-solid fa-comment" aria-hidden="true"></i>
                                                            <p className='font-bold' aria-label={t('commentsCount', video.comments)}>{video.comments}</p>
                                                        </div>

                                                        <div className='w-1/3 flex flex-col justify-center items-center'>
                                                            <i className="fa-solid fa-heart" aria-hidden="true"></i>
                                                            <p className='font-bold' aria-label={t('likesCount', video.likes)}>{video.likes}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center botones-tiktok">
                                                        <a
                                                            className="cursor-pointer bg-white text-black text-center font-semibold py-2 px-3 rounded text-sm btn-ver-tiktok"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                sendTikTokEvent('click_ver_en_tiktok', video);
                                                                window.open(video.url, '_blank');
                                                            }}
                                                            aria-label={t('seeOnTiktok')}
                                                            title={t('seeOnTiktok')}
                                                        >
                                                            {t('seeOnTiktok')}
                                                        </a>

                                                        <button
                                                            className="cursor-pointer bg-gray-600 bg-opacity-50 text-white py-2 px-3 rounded-full"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleToggleMute(idx);
                                                            }}
                                                            aria-label={mutedStates[idx] !== false ? t('enableSound') : t('mute')}
                                                            title={mutedStates[idx] !== false ? t('enableSound') : t('mute')}
                                                        >
                                                            <i className={mutedStates[idx] !== false ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high"}></i>
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </SplideSlide>
                            ))}
                        </Splide>
                    </div>
                </div>

                <div className='d-flex justify-end mt-5'>
                    <a
                        className="btn-sendTiktok"
                        target='_blank'
                        rel="noreferrer"
                        title={t('exploreMoreTitle')}
                        href={link}
                        aria-label={t('exploreMore')}
                    >
                        <span className="button_top">{t('exploreMore')}</span>
                    </a>
                </div>
            </div>
        </>
    );
};

export default TiktokCarousel;
