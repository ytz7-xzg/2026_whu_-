import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import {
  isValidElement,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./CardNav.css";

type CardNavLink = {
  label: string;
  href?: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export type CardNavItem = {
  label: string;
  description?: string;
  links?: CardNavLink[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
};

type CardNavProps = {
  logo?: ReactNode | string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const defaultNavLogo = (
  <div className="card-nav-brand" aria-label="MyNote">
    <span className="card-nav-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" className="card-nav-brand-svg">
        <defs>
          <linearGradient id="card-nav-brand-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8bb1ff" />
            <stop offset="52%" stopColor="#9d91ff" />
            <stop offset="100%" stopColor="#f29dd5" />
          </linearGradient>
        </defs>
        <rect x="8" y="7" width="24" height="31" rx="7" fill="url(#card-nav-brand-gradient)" opacity="0.2" />
        <path
          d="M12 12.5h13.5c3.6 0 6.5 2.9 6.5 6.5V35a1 1 0 0 1-1.7.7L24.3 30H12a4 4 0 0 1-4-4V16.5a4 4 0 0 1 4-4Z"
          fill="url(#card-nav-brand-gradient)"
          opacity="0.92"
        />
        <path
          d="M18.5 19.8c2-2.3 4.9-1.8 6.1.2 1 1.6.8 3.8-.9 5.6-.9.9-2.1 1.7-3.7 2.3"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </span>
    <span className="card-nav-brand-text">MyNote</span>
  </div>
);

export function CardNav({
  logo,
  logoAlt = "MyNote",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "rgba(255,255,255,0.6)",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  ctaLabel = "Direct Login",
  onCtaClick,
}: CardNavProps) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 300;

    const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement | null;
    if (!contentEl) return 300;

    const topBar = 60;
    const padding = 8;
    const contentHeight = contentEl.scrollHeight;
    return topBar + contentHeight + padding;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    const cards = cardsRef.current.filter(Boolean);
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cards, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });
    tl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
        return;
      }

      tlRef.current.kill();
      const newTl = createTimeline();
      if (newTl) tlRef.current = newTl;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
      return;
    }

    setIsHamburgerOpen(false);
    tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
    tl.reverse();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleMenu();
  };

  const setCardRef = (index: number) => (element: HTMLDivElement | null) => {
    cardsRef.current[index] = element;
  };

  const renderLogo = () => {
    if (typeof logo === "string" && logo.trim()) {
      return <img src={logo} alt={logoAlt} className="logo" />;
    }
    if (isValidElement(logo)) return logo;
    return defaultNavLogo;
  };

  const navStyle: CSSProperties = {
    background: baseColor,
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? "open" : ""}`} style={navStyle}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            onKeyDown={onMenuKeyDown}
            role="button"
            aria-label={isExpanded ? "Collapse overview" : "Expand overview"}
            tabIndex={0}
            style={{ color: menuColor || "#6d6687" }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">{renderLogo()}</div>

          <button
            type="button"
            className="card-nav-cta-button"
            style={{
              background: buttonBgColor || "linear-gradient(135deg, #8aa9ff, #a38af5 52%, #f29fd3)",
              color: buttonTextColor || "#ffffff",
            }}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => {
            const cardStyle = {
              background: item.bgColor,
              color: item.textColor || "#403f5f",
              "--card-nav-accent": item.accentColor || "rgba(145,131,240,0.44)",
            } as CSSProperties;

            return (
              <div
                key={`${item.label}-${idx}`}
                className="nav-card"
                ref={setCardRef(idx)}
                style={cardStyle}
              >
                <div className="nav-card-head">
                  <h3 className="nav-card-label">{item.label}</h3>
                  {item.description ? <p className="nav-card-description">{item.description}</p> : null}
                </div>
                <div className="nav-card-links">
                  {item.links?.map((link, i) => (
                    <a
                      key={`${link.label}-${i}`}
                      className="nav-card-link"
                      href={link.href || "#"}
                      aria-label={link.ariaLabel}
                      onClick={(event) => {
                        if (!link.href || link.href === "#") event.preventDefault();
                        link.onClick?.();
                      }}
                    >
                      <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
