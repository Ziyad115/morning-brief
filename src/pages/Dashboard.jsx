import { useEffect, useState } from "react";
import PriceStrip from "../components/PriceStrip.jsx";
import BriefCard from "../components/BriefCard.jsx";
import EarningsCard from "../components/EarningsCard.jsx";
import OvernightCard from "../components/OvernightCard.jsx";
import EventsList from "../components/EventsList.jsx";
import Footer from "../components/Footer.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Logo from "../components/Logo.jsx";
import { useTheme } from "../hooks/useTheme.jsx";
import { getTickers, getEarnings, getOvernight, getBrief, getEvents } from "../services/api.js";

const fallbackTickers = [
  { symbol: "SPX", name: "S&P 500", price: 6120, changePct: 0.3, stale: true, chartUrl: "https://www.tradingview.com/symbols/SPX/" },
  { symbol: "NDX", name: "Nasdaq 100", price: 21500, changePct: 0.5, stale: true, chartUrl: "https://www.tradingview.com/symbols/NASDAQ-NDX/" },
  { symbol: "DJI", name: "Dow Jones", price: 42000, changePct: 0.1, stale: true, chartUrl: "https://www.tradingview.com/symbols/DJ-DJI/" },
  { symbol: "TASI", name: "Tadawul (TASI)", price: 12045.3, changePct: -0.21, stale: true, chartUrl: "https://www.tradingview.com/symbols/TADAWUL-TASI/" },
  { symbol: "BTC", name: "Bitcoin", price: 68000, changePct: 1.2, stale: true, chartUrl: "https://www.tradingview.com/symbols/BTCUSD/" },
  { symbol: "VIX", name: "VIX", price: 15.15, changePct: -4.17, stale: true, chartUrl: "https://www.tradingview.com/symbols/CBOE-VIX/" },
  { symbol: "GOLD", name: "Gold", price: 2400, changePct: 0.4, stale: true, chartUrl: "https://www.tradingview.com/symbols/TVC-GOLD/" },
  { symbol: "OIL", name: "WTI Crude Oil", price: 78, changePct: 0.1, stale: true, chartUrl: "https://www.tradingview.com/symbols/USOIL/" },
  { symbol: "RUT", name: "Russell 2000", price: 3001.55, changePct: -0.58, stale: true, chartUrl: "https://www.tradingview.com/symbols/CBOEFTSE-RUT/" },
  { symbol: "DXY", name: "US Dollar Index", price: 99.84, changePct: -0.09, stale: true, chartUrl: "https://www.tradingview.com/symbols/TVC-DXY/" },
  { symbol: "US10Y", name: "US 10Y Yield", price: 4.67, changePct: 1.15, stale: true, chartUrl: "https://www.tradingview.com/symbols/TVC-US10Y/" },
  { symbol: "ETH", name: "Ethereum", price: 3400, changePct: 0.8, stale: true, chartUrl: "https://www.tradingview.com/symbols/ETHUSD/" },
  { symbol: "AAPL", name: "Apple", price: 231, changePct: -0.15, stale: true, chartUrl: "https://www.tradingview.com/symbols/NASDAQ-AAPL/" },
  { symbol: "NVDA", name: "Nvidia", price: 143.77, changePct: 2.1, stale: true, chartUrl: "https://www.tradingview.com/symbols/NASDAQ-NVDA/" },
  { symbol: "ARAMCO", name: "Saudi Aramco", price: 25.88, changePct: 0.31, stale: true, chartUrl: "https://www.tradingview.com/symbols/TADAWUL-2222/" },
];

function formatKsaTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getKsaHour() {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  return parseInt(hourStr, 10);
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Morning Brief");

  useEffect(() => {
    const update = () => {
      const hour = getKsaHour();
      if (hour < 5) setGreeting("Still up? Here's the brief");
      else if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    update();
    const interval = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}

function useKsaDateLabel() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const update = () => {
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
      setLabel(formatted);
    };
    update();
    const interval = setInterval(update, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return label;
}

const ACCENT_CLASSES = {
  amber: "bg-dawn-amber",
  coral: "bg-dawn-coral",
  rose: "bg-dawn-rose",
  violet: "bg-dawn-violet",
  sky: "bg-dawn-sky",
};

function SectionHeader({ children, accent }) {
  return (
    <div className="mb-3">
      <div className={`section-accent ${ACCENT_CLASSES[accent] || ACCENT_CLASSES.amber}`} />
      <h2 className="text-sm font-semibold text-ink-muted dark:text-moon-muted uppercase tracking-wide">
        {children}
      </h2>
    </div>
  );
}

function MarketPulse({ tickers }) {
  if (!tickers || tickers.length === 0) return null;
  const upCount = tickers.filter((t) => t.changePct >= 0).length;
  const total = tickers.length;
  const majority = upCount > total / 2;

  return (
    <p className="text-sm text-ink-muted dark:text-moon-muted mt-2">
      <span className={majority ? "text-rise font-medium" : "text-fall font-medium"}>
        {upCount} of {total}
      </span>{" "}
      tracked assets are up this morning.
    </p>
  );
}

export default function Dashboard() {
  const [tickers, setTickers] = useState(fallbackTickers);
  const [earnings, setEarnings] = useState([]);
  const [overnight, setOvernight] = useState([]);
  const [briefSummary, setBriefSummary] = useState([]);
  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const dateLabel = useKsaDateLabel();
  const greeting = useGreeting();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    Promise.allSettled([getTickers(), getEarnings(), getOvernight(), getBrief(), getEvents()]).then(
      ([tickersRes, earningsRes, overnightRes, briefRes, eventsRes]) => {
        if (tickersRes.status === "fulfilled" && Array.isArray(tickersRes.value) && tickersRes.value.length > 0) {
          setTickers(tickersRes.value);
        }
        if (earningsRes.status === "fulfilled") setEarnings(earningsRes.value);
        if (overnightRes.status === "fulfilled") setOvernight(overnightRes.value);
        if (briefRes.status === "fulfilled" && briefRes.value?.summary) {
          setBriefSummary(briefRes.value.summary);
        }
        if (eventsRes.status === "fulfilled") setEvents(eventsRes.value);
        setLastUpdated(new Date());
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-paper dark:bg-night flex flex-col transition-colors duration-300">
      <div className="bg-sunrise dark:bg-nightsky transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-7">
          <div className="flex items-center justify-between">
            <Logo />
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 pb-6">
          <header className="animate-rise-in">
            <h1 className="text-xl sm:text-2xl font-semibold text-ink dark:text-moon">{greeting}</h1>
            <p className="text-sm text-ink-muted dark:text-moon-muted mt-1">
              {dateLabel}
              {lastUpdated && (
                <span className="text-ink-faint dark:text-moon-faint"> · Updated {formatKsaTime(lastUpdated)}</span>
              )}
            </p>
            <MarketPulse tickers={tickers} />
          </header>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 flex-1 w-full">
        <div className="mb-8 sm:mb-10 -mt-2 animate-rise-in" style={{ animationDelay: "0.1s" }}>
          <PriceStrip tickers={tickers} />
        </div>

        <section className="mb-8 sm:mb-10 animate-rise-in" style={{ animationDelay: "0.2s" }}>
          <SectionHeader accent="amber">At a glance</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            <EarningsCard earnings={earnings} />
            <EventsList events={events} />
            <OvernightCard markets={overnight} />
          </div>
        </section>

        <section className="animate-rise-in" style={{ animationDelay: "0.3s" }}>
          <SectionHeader accent="coral">Market news</SectionHeader>
          {briefSummary.length === 0 ? (
            <div className="brief-card">
              <p className="text-sm text-ink-muted dark:text-moon-muted">Loading today's news brief…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 auto-rows-fr">
              {briefSummary.map((item) => (
                <BriefCard key={item.theme} theme={item.theme} headlines={item.headlines} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
