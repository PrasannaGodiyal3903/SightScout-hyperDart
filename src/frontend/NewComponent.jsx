import React, { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { LOGO_BASE64 } from "./logoData";

/* ─── Gradient fallbacks for cards without images ─── */
const GRADIENTS = [
  "linear-gradient(38deg, #53b2fe, #065af3)",
  "linear-gradient(38deg, #f5515f, #9f0469)",
  "linear-gradient(38deg, #c86dd7, #3023ae)",
  "linear-gradient(38deg, #f0772c, #f95776)",
  "linear-gradient(38deg, #43e1a8, #219393)",
  "linear-gradient(38deg, #ff3c96, #842493)",
  "linear-gradient(38deg, #00d2ff, #3a7bd5)",
  "linear-gradient(38deg, #f3d452, #f09819)",
  "linear-gradient(38deg, #11998e, #38ef7d)",
  "linear-gradient(38deg, #fc5c7d, #6a82fb)",
];

/* ─── Category → emoji map (shown only when no image) ─── */
const CATEGORY_ICONS = {
  "tourism.sights": "🏛️",
  "entertainment.museum": "🏛️",
  "leisure.park": "🌳",
  "tourism.attraction.viewpoint": "🌄",
  "tourism.attraction.artwork": "🎨",
  "tourism.sights.castle": "🏰",
  "tourism.sights.place_of_worship": "⛪",
  "tourism.sights.memorial": "🗿",
  "entertainment.zoo": "🦁",
  "entertainment.aquarium": "🐠",
  "entertainment.culture.gallery": "🖼️",
  "entertainment.culture.theatre": "🎭",
};

function getCategoryEmoji(category) {
  if (!category) return "📍";
  for (const [key, emoji] of Object.entries(CATEGORY_ICONS)) {
    if (category.startsWith(key)) return emoji;
  }
  return "📍";
}

function formatCategory(cat) {
  if (!cat) return "";
  return cat
    .split(".")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" · ");
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  STYLES — Dark travel aesthetic with Inter typography              */
/* ═══════════════════════════════════════════════════════════════════ */

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const styles = {
  /* ── Page wrapper ── */
  wrapper: {
    fontFamily: FONT,
    backgroundColor: "#121212",
    color: "#fff",
    padding: "24px 16px",
    minHeight: 300,
    borderRadius: 12,
  },

  /* ── Branding ── */
  branding: {
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: 12,
  },
  appName: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: "#fff",
  },

  /* ── Section header ── */
  headerBox: {
    marginBottom: 24,
    paddingLeft: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    lineHeight: "32px",
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: 13,
    color: "#b0b0b0",
    marginTop: 6,
    fontWeight: 400,
    lineHeight: "18px",
  },
  placeCount: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  /* ── Grid ── */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
    gap: 16,
  },

  /* ── Card ── */
  card: {
    backgroundColor: "#1a1a1b",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    cursor: "default",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
  },

  /* ── Image container ── */
  imageContainer: {
    height: 200,
    borderRadius: "12px 12px 0 0",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  realImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: "linear-gradient(to top, rgba(26,26,27,0.85), transparent)",
    pointerEvents: "none",
  },
  imageEmoji: {
    fontSize: 48,
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
    userSelect: "none",
  },

  /* ── Rank badge ── */
  rankBadge: {
    minWidth: 24,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#249995",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    marginRight: 8,
    flexShrink: 0,
    padding: "0 6px",
  },

  /* ── Card body ── */
  cardBody: {
    padding: "16px 18px 20px 18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  titleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    lineHeight: "24px",
    letterSpacing: "-0.1px",
  },
  categoryPill: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 600,
    color: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    padding: "3px 8px",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: "0.6px",
  },
  cardDescription: {
    fontSize: 13,
    color: "#a0a0a0",
    lineHeight: "19px",
    marginBottom: 14,
    flex: 1,
    fontWeight: 400,
  },
  addressRow: {
    display: "flex",
    gap: 5,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  addressText: {
    fontSize: 12,
    color: "#888",
    lineHeight: "16px",
    fontWeight: 400,
  },
  coordsText: {
    fontSize: 11,
    color: "#666",
    fontWeight: 500,
    letterSpacing: "0.2px",
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 14,
    marginTop: 6,
  },

  /* ── CTA ── */
  ctaGroup: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "stretch",
  },
  mapCta: {
    flex: 1,
    padding: "10px 16px",
    textTransform: "uppercase",
    fontWeight: 600,
    fontSize: 11,
    cursor: "pointer",
    backgroundColor: "#7fb4fe",
    color: "#0d0d0d",
    borderRadius: 8,
    border: "none",
    textAlign: "center",
    textDecoration: "none",
    transition: "background-color 0.2s ease, opacity 0.2s ease",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
    fontFamily: FONT,
  },

  /* ── Loading / error states ── */
  centeredBox: {
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 12,
    fontFamily: FONT,
    backgroundColor: "#121212",
    borderRadius: 12,
    padding: 32,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2.5px solid rgba(127,180,254,0.15)",
    borderTop: "2.5px solid #7fb4fe",
    borderRadius: "50%",
    animation: "te-spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 13,
    color: "#777",
    fontWeight: 400,
  },
  alertBox: {
    backgroundColor: "#1a1a1b",
    borderRadius: 10,
    padding: "20px 24px",
    fontSize: 14,
    fontFamily: FONT,
    fontWeight: 400,
  },
  alertError: {
    color: "#f5515f",
    border: "1px solid rgba(245,81,95,0.2)",
  },
  alertInfo: {
    color: "#7fb4fe",
    border: "1px solid rgba(127,180,254,0.2)",
  },
};

/* ── Inject keyframe + Inter font (once) ── */
const STYLE_INJECT_ID = "te-style-inject";
if (typeof document !== "undefined" && !document.getElementById(STYLE_INJECT_ID)) {
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_INJECT_ID;
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Josefin+Sans:wght@600;700&display=swap');
    @keyframes te-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleEl);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  ImageHero — renders real image or gradient fallback               */
/* ═══════════════════════════════════════════════════════════════════ */

function ImageHero({ imageUrl, gradient, emoji }) {
  const [imgFailed, setImgFailed] = useState(false);

  const showReal = imageUrl && !imgFailed;

  return (
    <div
      style={{
        ...styles.imageContainer,
        backgroundImage: showReal ? "none" : gradient,
      }}
    >
      {showReal ? (
        <>
          <img
            src={imageUrl}
            alt=""
            style={styles.realImage}
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
          <div style={styles.imageOverlay} />
        </>
      ) : (
        <span style={styles.imageEmoji}>{emoji}</span>
      )}
    </div>
  );
}

/* ─── Logo icon component ─── */
function Logo() {
  return (
    <img
      src={LOGO_BASE64}
      alt="SightScout Logo"
      style={{
        width: 30,
        height: 30,
        marginRight: 10,
        flexShrink: 0,
        objectFit: "contain",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  COMPONENT                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

function NewComponent(props) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const searchData = props?.searchData;

  // Find the location entity instead of assuming entities[0]
  const locationEntity = searchData?.entities?.find(
    (entity) => entity?.entityType === "LOCATION"
  );

  const geo = locationEntity?.entityInfo?.geo;

  const lat = geo?.lat;
  const lon = geo?.long;
  const city =
    geo?.city ||
    locationEntity?.word ||
    searchData?.entities?.[0]?.word ||
    "your destination";
  const query = searchData?.query?.toLowerCase() || "";

  let heading = `Explore ${city}`;

  if (query.includes("museum")) {
    heading = `🏛️ Museums in ${city}`;
  } else if (query.includes("park") || query.includes("garden")) {
    heading = `🌳 Parks & Gardens in ${city}`;
  } else if (query.includes("landmark")) {
    heading = `📍 Landmarks in ${city}`;
  } else if (query.includes("viewpoint")) {
    heading = `🌄 Viewpoints in ${city}`;
  } else if (query.includes("monument") || query.includes("memorial")) {
    heading = `🏛️ Monuments in ${city}`;
  } else {
    heading = `📍 Explore ${city}`;
  }
  /*
   * Client-side Wikipedia image fetching.
   * The backend can't reliably reach Wikipedia from Cloudflare Workers,
   * so we fetch images directly from the browser (CORS origin=* works here).
   * Images are stored in a separate map keyed by index — places state is never mutated.
   */
  const [images, setImages] = useState({});

  useEffect(() => {
    if (places.length === 0) return;

    const IMAGE_LIMIT = 8; // only fetch for top 8

    async function fetchImage(placeName, cityName) {
      try {
        const searchTerm = cityName ? `${placeName} ${cityName}` : placeName;
        const url =
          `https://en.wikipedia.org/w/api.php` +
          `?action=query` +
          `&generator=search` +
          `&gsrsearch=${encodeURIComponent(searchTerm)}` +
          `&gsrlimit=1` +
          `&prop=pageimages` +
          `&format=json` +
          `&pithumbsize=600` +
          `&origin=*`;

        const resp = await fetch(url);
        if (!resp.ok) return null;

        const json = await resp.json();
        const pages = json?.query?.pages;
        if (!pages) return null;

        for (const page of Object.values(pages)) {
          if (page?.thumbnail?.source) {
            return page.thumbnail.source;
          }
        }
        return null;
      } catch {
        return null;
      }
    }

    let cancelled = false;

    async function loadImages() {
      const slice = places.slice(0, IMAGE_LIMIT);
      const results = await Promise.all(
        slice.map((p) => fetchImage(p.name, city).catch(() => null))
      );

      if (cancelled) return;

      const map = {};
      for (let i = 0; i < results.length; i++) {
        if (results[i]) {
          map[i] = results[i];
        }
      }
      if (Object.keys(map).length > 0) {
        setImages(map);
      }
    }

    loadImages();
    return () => { cancelled = true; };
  }, [places, city]);

  useEffect(() => {
    // HyperDart may render the component before searchData arrives.
    if (!searchData || !lat || !lon) {
      return;
    }

    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:3001/api/tourism?lat=${lat}&lon=${lon}&query=${encodeURIComponent(
            searchData.query
          )}&city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tourist attractions");
        }

        const data = await response.json();

        setPlaces(data.places || []);
      } catch (err) {
        console.error("Tourism API error:", err);
        setError("Unable to load tourist attractions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [searchData, lat, lon]);

  /* ── Wait for HyperDart searchData ── */
  if (!searchData || !lat || !lon) {
    return (
      <div style={styles.centeredBox}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Understanding your destination…</span>
      </div>
    );
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={styles.centeredBox}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Exploring {city}…</span>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{ ...styles.alertBox, ...styles.alertError }}>{error}</div>
    );
  }

  /* ── Empty state ── */
  if (places.length === 0) {
    return (
      <div style={{ ...styles.alertBox, ...styles.alertInfo }}>
        No tourist attractions found in {city}.
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={styles.wrapper}>
      {/* ── App branding header ── */}
      <div style={styles.branding}>
        <Logo />
        <span style={styles.appName}>SightScout</span>
      </div>

      {/* ── Section header ── */}
      <div style={styles.headerBox}>
        <h2 style={styles.heading}>{heading}</h2>
        <p style={styles.subtitle}>
          Discover popular attractions and places worth visiting.
        </p>
        <p style={styles.placeCount}>
          {places.length} places found within 5 km
        </p>
      </div>

      {/* ── Card grid ── */}
      <div style={styles.grid}>
        {places.map((place, index) => {
          const isHovered = hoveredCard === index;
          const gradient = GRADIENTS[index % GRADIENTS.length];
          const emoji = getCategoryEmoji(place.category);

          return (
            <div
              key={`${place.name}-${index}`}
              style={{
                ...styles.card,
                ...(isHovered ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* ── Image or gradient fallback ── */}
              <ImageHero
                imageUrl={images[index] || place.image}
                gradient={gradient}
                emoji={emoji}
              />

              {/* ── Card body ── */}
              <div style={styles.cardBody}>
                {/* Title row with rank badge */}
                <div style={styles.titleRow}>
                  <span style={styles.rankBadge}>{index + 1}</span>
                  <h3 style={styles.cardTitle}>{place.name}</h3>
                </div>

                {/* Category pill */}
                {place.category && (
                  <span style={styles.categoryPill}>
                    {formatCategory(place.category)}
                  </span>
                )}

                {/* Description */}
                {place.description && (
                  <p style={styles.cardDescription}>{place.description}</p>
                )}

                {/* Address */}
                {place.address && (
                  <div style={styles.addressRow}>
                    <LocationOnIcon
                      style={{ fontSize: 14, color: "#666", flexShrink: 0, marginTop: 1 }}
                    />
                    <span style={styles.addressText}>{place.address}</span>
                  </div>
                )}

                {/* Coordinates */}
                {place.lat && place.lon && (
                  <span style={styles.coordsText}>
                    {Math.abs(Number(place.lat)).toFixed(4)}°{" "}
                    {Number(place.lat) >= 0 ? "N" : "S"} ·{" "}
                    {Math.abs(Number(place.lon)).toFixed(4)}°{" "}
                    {Number(place.lon) >= 0 ? "E" : "W"}
                  </span>
                )}

                {/* Divider */}
                <div style={styles.divider} />

                {/* CTA */}
                <div style={styles.ctaGroup}>
                  {place.lat && place.lon && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.mapCta}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#6ba3f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#7fb4fe";
                      }}
                    >
                      View on Map →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NewComponent;