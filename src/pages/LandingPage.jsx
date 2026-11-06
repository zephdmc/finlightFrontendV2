import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  const slides = [
    {
      icon: "🛡️",
      iconBg: "rgba(38,131,233,0.15)",
      iconColor: "#2683e9",
      title: "Bank-grade security",
      desc: "256-bit SSL encryption and PCI DSS compliance keep every naira safe",
    },
    {
      icon: "💳",
      iconBg: "rgba(17,80,195,0.15)",
      iconColor: "#1150c3",
      title: "Instant due payments",
      desc: "Pay contributions in seconds via Paystack, Flutterwave, Opay and more",
    },
    {
      icon: "👥",
      iconBg: "rgba(49,174,117,0.15)",
      iconColor: "#31ae75",
      title: "Member management",
      desc: "Manage roles, profiles and permissions for your entire association",
    },
    {
      icon: "📊",
      iconBg: "rgba(38,131,233,0.15)",
      iconColor: "#2683e9",
      title: "Financial reports",
      desc: "Generate contribution summaries and export to PDF or Excel anytime",
    },
    {
      icon: "🔔",
      iconBg: "rgba(17,80,195,0.15)",
      iconColor: "#1150c3",
      title: "Real-time alerts",
      desc: "SMS, email and WhatsApp notifications for every payment and update",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (i) => {
    if (i === activeSlide) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveSlide(i);
      setAnimating(false);
    }, 300);
  };

  return (
    <div style={styles.splash}>
      {/* Background orbs */}
      <div style={{ ...styles.orb, ...styles.orb1 }} />
      <div style={{ ...styles.orb, ...styles.orb2 }} />
      <div style={{ ...styles.orb, ...styles.orb3 }} />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.badge}>
          <div style={styles.badgeDot} />
          Smart Finance, Strong Community
        </div>

        <div style={styles.logoWrap}>
          <div style={styles.logoRing}>
            <div style={styles.logoShine} />
            {/* Real Logo */}
            <img
              src="/icon-192x192.png"
              alt="Finlight Logo"
              style={styles.logoImage}
            />
          </div>
        </div>

        <div style={styles.appName}>
          <span style={styles.appNameGradient}>Finlight</span>
        </div>
        <p style={styles.tagline}>
          Modern Community Financial Management
        </p>

        {/* Feature Slides */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>what we offer</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Feature Slide */}
        <div style={styles.slideArea}>
          <div
            style={{
              ...styles.slide,
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(10px)" : "translateY(0)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <div
              style={{
                ...styles.slideIcon,
                background: slides[activeSlide].iconBg,
              }}
            >
              <span style={{ fontSize: 22 }}>{slides[activeSlide].icon}</span>
            </div>
            <div style={styles.slideText}>
              <h4 style={styles.slideTitle}>{slides[activeSlide].title}</h4>
              <p style={styles.slideDesc}>{slides[activeSlide].desc}</p>
            </div>
          </div>

          {/* Dots */}
          <div style={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  ...styles.dot,
                  background: i === activeSlide ? "#2683e9" : "rgba(255,255,255,0.25)",
                  width: i === activeSlide ? 22 : 8,
                }}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  splash: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #012a7b 30%, #1150c3 70%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  orb: {
    position: "absolute",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(60px)",
  },
  orb1: {
    width: 260, height: 260,
    background: "#1150c3", opacity: 0.18,
    top: -60, left: -60,
  },
  orb2: {
    width: 200, height: 200,
    background: "#2683e9", opacity: 0.15,
    top: 80, right: -50,
    filter: "blur(50px)",
  },
  orb3: {
    width: 300, height: 300,
    background: "#31ae75", opacity: 0.12,
    bottom: 200, left: -80,
    filter: "blur(80px)",
  },
  hero: {
    position: "relative", zIndex: 1,
    display: "flex", flexDirection: "column",
    alignItems: "center",
    padding: "52px 28px 0",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(38,131,233,0.12)",
    border: "1px solid rgba(38,131,233,0.3)",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: 11,
    color: "#a5d6ff",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 28,
  },
  badgeDot: {
    width: 6, height: 6,
    borderRadius: "50%",
    background: "#31ae75",
  },
  logoWrap: { marginBottom: 24 },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 24,
    background: "linear-gradient(135deg, #012a7b 0%, #2683e9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 8px rgba(38,131,233,0.15), 0 0 0 16px rgba(38,131,233,0.08)",
    position: "relative",
    padding: "6px",
  },
  logoShine: {
    position: "absolute",
    top: 10,
    left: 14,
    width: 22,
    height: 10,
    background: "rgba(255,255,255,0.35)",
    borderRadius: 8,
    transform: "rotate(-20deg)",
    zIndex: 2,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 18,
    zIndex: 1,
  },
  appName: {
    fontSize: 32, fontWeight: 700,
    color: "#fff", letterSpacing: "-0.02em",
    marginBottom: 10,
  },
  appNameGradient: {
    background: "linear-gradient(90deg, #ffffff 0%, #a5d6ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tagline: {
    fontSize: 14, color: "#a5d6ff",
    lineHeight: 1.6, maxWidth: 280,
    marginBottom: 32,
  },
  btnRow: {
    display: "flex", flexDirection: "column", gap: 12,
    width: "100%", maxWidth: 300,
    marginBottom: 40,
  },
  btnPrimary: {
    width: "100%", padding: "14px",
    background: "linear-gradient(135deg, #31ae75 0%, #2683e9 100%)",
    border: "none", borderRadius: 14,
    color: "#fff", fontSize: 15, fontWeight: 600,
    cursor: "pointer", letterSpacing: "0.01em",
    transition: "opacity 0.2s",
  },

  /* Divider & Slide Styles */
  divider: {
    width: "100%", maxWidth: 320,
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 20,
    position: "relative", zIndex: 1,
  },
  dividerLine: {
    flex: 1, height: 1,
    background: "rgba(255,255,255,0.12)",
  },
  dividerText: {
    fontSize: 11, color: "#a5d6ff",
    letterSpacing: "0.05em",
  },
  slideArea: {
    width: "100%", padding: "0 20px",
    position: "relative", zIndex: 1,
    marginBottom: 32,
  },
  slide: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 12,
    minHeight: 100,
  },
  slideIcon: {
    width: 46, height: 46, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  slideText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  slideTitle: {
    fontSize: 14, fontWeight: 600,
    color: "#ffffff", marginBottom: 6,
  },
  slideDesc: {
    fontSize: 12.5, color: "#c3d4ff",
    lineHeight: 1.5, margin: 0,
    maxWidth: "260px",
  },
  dots: {
    display: "flex", justifyContent: "center",
    alignItems: "center", gap: 6,
    marginTop: 16,
  },
  dot: {
    height: 8, borderRadius: 4,
    border: "none", cursor: "pointer",
    padding: 0, transition: "all 0.3s ease",
  },
};

export default LandingPage;


