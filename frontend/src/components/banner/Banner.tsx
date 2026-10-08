import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaHandHoldingHeart,
  FaListAlt,
  FaPlusCircle,
  FaSearch,
} from "react-icons/fa";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "Lost something? Report here!",
      title: "Welcome to Lost and Found Management",
      highlight: "Lost and Found",
      description:
        "Lost and Found Management is your reliable partner in handling lost items. Whether you've misplaced your belongings or found something left behind, we're here to assist with our modern, efficient system.",
      primaryButton: {
        text: "Report a Lost Item",
        href: "/reportlostItem",
        icon: <FaPlusCircle />,
      },
      secondaryButton: {
        text: "Report a Found Item",
        href: "/reportFoundItem",
        icon: <FaHandHoldingHeart />,
      },
    },
    {
      badge: "Found something? Help others!",
      title: "Help Reunite Items with Their Owners",
      highlight: "Reunite Items",
      description:
        "Join our community of helpful citizens. By reporting found items, you're making a difference in someone's day. Every item reported brings us closer to a more connected community.",
      primaryButton: {
        text: "Report Found Item",
        href: "/reportFoundItem",
        icon: <FaHandHoldingHeart />,
      },
      secondaryButton: {
        text: "Browse Lost Items",
        href: "/lostItems",
        icon: <FaListAlt />,
      },
    },
    {
      badge: "Need help? We're here!",
      title: "Track Your Items & Claims",
      highlight: "Items & Claims",
      description:
        "Stay updated on your lost item reports and claim requests. Our advanced tracking system ensures you never miss an update when your belongings are found.",
      primaryButton: {
        text: "View My Found Items",
        href: "/dashboard/myFoundItems",
        icon: <FaBoxOpen />,
      },
      secondaryButton: {
        text: "Browse Found Items",
        href: "/foundItems",
        icon: <FaSearch />,
      },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  // Split the headline so .text-gradient lands on the key phrase only
  const highlightIndex = currentSlideData.title.indexOf(
    currentSlideData.highlight
  );

  return (
    <section className="relative flex min-h-[75vh] items-center overflow-hidden py-24 lg:py-28">
      {/* Ambient accent glow + faint grid (page canvas shows through) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent)]" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div key={currentSlide} className="animate-fade-up">
          {/* Badge pill */}
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/60 px-4 py-1.5 text-sm text-ink-dim backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {currentSlideData.badge}
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-ink md:text-5xl lg:text-6xl">
            {highlightIndex >= 0 ? (
              <>
                {currentSlideData.title.slice(0, highlightIndex)}
                <span className="text-gradient">
                  {currentSlideData.highlight}
                </span>
                {currentSlideData.title.slice(
                  highlightIndex + currentSlideData.highlight.length
                )}
              </>
            ) : (
              currentSlideData.title
            )}
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-ink-dim lg:text-xl">
            {currentSlideData.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to={currentSlideData.primaryButton.href}
              className="btn btn-brand btn-lg group"
            >
              {currentSlideData.primaryButton.text}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                {currentSlideData.primaryButton.icon}
              </span>
            </Link>
            <Link
              to={currentSlideData.secondaryButton.href}
              className="btn btn-outline btn-lg group"
            >
              {currentSlideData.secondaryButton.text}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                {currentSlideData.secondaryButton.icon}
              </span>
            </Link>
          </div>

          {/* Carousel indicators */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDotClick(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-6 bg-accent"
                    : "w-3 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
