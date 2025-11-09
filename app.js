const { useEffect, useRef, useState } = React;

function useInterval(callback, delay, enabled = true) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (!enabled || delay == null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}

function Carousel({ images, autoplay = true, interval = 2500 }) {
  const [index, setIndex] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const trackRef = useRef(null);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const touchActive = useRef(false);

  const goTo = (i) => setIndex((i + images.length) % images.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useInterval(next, interval, autoplay && !isHover);

  // Keyboard navigation
  const containerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(images.length - 1);
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [index, images.length]);

  // Touch/drag swipe
  const onPointerDown = (e) => {
    touchActive.current = true;
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = 0;
  };
  const onPointerMove = (e) => {
    if (!touchActive.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = x - startX.current;
    const track = trackRef.current;
    if (track) {
      const offset = -index * 100 + (deltaX.current / track.clientWidth) * 100;
      track.style.transition = 'none';
      track.style.transform = `translateX(${offset}%)`;
    }
  };
  const onPointerUp = () => {
    if (!touchActive.current) return;
    touchActive.current = false;
    const track = trackRef.current;
    if (track) track.style.transition = '';
    if (Math.abs(deltaX.current) > 40) {
      if (deltaX.current < 0) next(); else prev();
    } else {
      if (track) track.style.transform = `translateX(${-index * 100}%)`;
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (track) track.style.transform = `translateX(${-index * 100}%)`;
  }, [index]);

  return (
    <div
      className="card carousel"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      ref={containerRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Photo carousel"
    >
      <div
        className="viewport"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        <div className="track" ref={trackRef}>
          {images.map((img, i) => (
            <div className="slide" key={i} aria-hidden={i !== index}>
              <img src={img.src} alt={img.alt || `Slide ${i+1}`} loading="lazy" />
            </div>
          ))}
        </div>
        <button className="navBtn navPrev" aria-label="Previous" onClick={prev}>&#10094;</button>
        <button className="navBtn navNext" aria-label="Next" onClick={next}>&#10095;</button>
      </div>

      <div className="dots" role="tablist" aria-label="Slide thumbnails">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? 'active' : ''}`}
            aria-label={`Go to slide ${i+1}`}
            aria-selected={i === index}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="toolbar">
        <div>
          <button className="btn" onClick={prev}>Prev</button>
          <button className="btn" onClick={next} style={{ marginLeft: '.5rem' }}>Next</button>
        </div>
        <div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoplay && !isHover} readOnly /> Autoplay (pauses on hover)
          </label>
        </div>
      </div>

      <div className="thumbs" aria-label="Thumbnails">
        {images.map((img, i) => (
          <div key={i} className={`thumb ${i === index ? 'active' : ''}`} onClick={() => goTo(i)}>
            <img src={img.src} alt={img.alt || `Thumb ${i+1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const images = [
    { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop', alt: 'Mountain lake at sunrise' },
    { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop', alt: 'City skyline at dusk' },
    { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop', alt: 'Forest road with mist' },
    { src: 'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?q=80&w=1600&auto=format&fit=crop', alt: 'Beach and ocean waves' },
    { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop', alt: 'Starry night desert' },
  ];

  return <Carousel images={images} autoplay={true} interval={2500} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
