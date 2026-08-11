import { useRef, useEffect, useCallback } from "react";
import clsx from "clsx";

/**
 * Unified ticker strip.
 *
 * Mobile autoscroll fix: touch interactions on a horizontally
 * scrollable element frequently fire `touchcancel` instead of
 * `touchend` once the browser's native scroll gesture takes over.
 * Previously only `onTouchEnd` was wired to resume the animation,
 * so a `touchcancel` left `isPausedRef` stuck at `true` forever —
 * the strip would pause on first touch and never resume. Both
 * events now call the same resume handler.
 */

const CATEGORY_DOT = {
  SPX: "bg-accent dark:bg-[#5EEAD4]",
  NDX: "bg-accent dark:bg-[#5EEAD4]",
  DJI: "bg-accent dark:bg-[#5EEAD4]",
  RUT: "bg-accent dark:bg-[#5EEAD4]",
  TASI: "bg-accent dark:bg-[#5EEAD4]",
  BTC: "bg-[#F7931A] dark:bg-[#FFB74D]",
  ETH: "bg-[#627EEA] dark:bg-[#8B9CFF]",
  GOLD: "bg-[#D4AF37] dark:bg-[#F2D065]",
  OIL: "bg-[#5C4033] dark:bg-[#C08552]",
  VIX: "bg-fall dark:bg-[#FF6B6B]",
  DXY: "bg-[#2563EB] dark:bg-[#5B9BFF]",
  US10Y: "bg-[#2563EB] dark:bg-[#5B9BFF]",
  AAPL: "bg-ink-faint dark:bg-moon-muted",
  NVDA: "bg-rise dark:bg-[#6EE7A0]",
  ARAMCO: "bg-[#00693C] dark:bg-[#3DDC84]",
};

export default function PriceStrip({ tickers = [] }) {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const dragMovedRef = useRef(false);

  const SPEED_PX_PER_FRAME = 0.45;
  const RESUME_DELAY_MS = 500;

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, RESUME_DELAY_MS);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const tick = () => {
      if (el) {
        if (!isPausedRef.current) {
          el.scrollLeft += SPEED_PX_PER_FRAME;
        }
        const singleSetWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= singleSetWidth) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft < 0) {
          el.scrollLeft += singleSetWidth;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scrollByButton = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    pause();
    el.scrollLeft += 220 * direction;
    scheduleResume();
  };

  const handleWheel = () => {
    pause();
    scheduleResume();
  };

  const handleMouseEnter = () => pause();
  const handleMouseLeave = () => {
    if (!isDraggingRef.current) scheduleResume();
  };

  // Fires on touchend AND touchcancel — see note above.
  const handleTouchRelease = () => {
    isDraggingRef.current = false;
    scheduleResume();
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragScrollLeftRef.current = scrollRef.current.scrollLeft;
    pause();
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 4) dragMovedRef.current = true;
    scrollRef.current.scrollLeft = dragScrollLeftRef.current - delta;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    scheduleResume();
  };

  const handleLinkClick = (e) => {
    if (dragMovedRef.current) e.preventDefault();
  };

  const renderTicker = (t, keySuffix, isLast) => {
    const positive = t.changePct >= 0;
    const dotClasses = CATEGORY_DOT[t.symbol] || "bg-accent dark:bg-dawn-amber";
    return (
      <a
        key={`${t.symbol}-${keySuffix}`}
        href={t.chartUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        draggable={false}
        title={
          t.stale
            ? `${t.name} — showing last known value, live data unavailable. Click to view full chart.`
            : `View ${t.name} chart on TradingView`
        }
        className={clsx(
          "group flex items-center gap-2 shrink-0 select-none px-4 sm:px-5 py-3 cursor-pointer",
          "hover:bg-accent-soft dark:hover:bg-night-border transition-colors duration-150",
          !isLast && "border-r border-line dark:border-night-border"
        )}
      >
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-transform group-hover:scale-125",
            dotClasses
          )}
          aria-hidden
        />
        <span className="text-sm font-semibold text-ink dark:text-moon">{t.symbol}</span>
        <span className="text-sm text-ink-muted dark:text-moon-muted">
          {t.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className={clsx("text-sm font-semibold", positive ? "text-rise" : "text-fall")}>
          {positive ? "+" : ""}
          {t.changePct.toFixed(2)}%
        </span>
        {t.stale && (
          <span className="w-1.5 h-1.5 rounded-full bg-ink-faint dark:bg-moon-faint" aria-label="Stale data" />
        )}
      </a>
    );
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => scrollByButton(-1)}
        aria-label="Scroll left"
        className="hidden sm:flex shrink-0 z-10 w-7 h-7 mr-2 items-center justify-center rounded-full bg-white dark:bg-night-soft hairline shadow-card hover:shadow-cardHover active:scale-95 transition-all text-ink-muted dark:text-moon-muted hover:text-ink dark:hover:text-moon"
      >
        ‹
      </button>

      <div className="flex-1 overflow-hidden rounded-full bg-paper-soft dark:bg-night-soft hairline">
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleTouchRelease}
          onTouchCancel={handleTouchRelease}
          className={clsx(
            "flex overflow-x-auto cursor-grab active:cursor-grabbing",
            "[&::-webkit-scrollbar]:hidden"
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {tickers.map((t, i) => renderTicker(t, "a", false))}
          {tickers.map((t, i) => renderTicker(t, "b", i === tickers.length - 1))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByButton(1)}
        aria-label="Scroll right"
        className="hidden sm:flex shrink-0 z-10 w-7 h-7 ml-2 items-center justify-center rounded-full bg-white dark:bg-night-soft hairline shadow-card hover:shadow-cardHover active:scale-95 transition-all text-ink-muted dark:text-moon-muted hover:text-ink dark:hover:text-moon"
      >
        ›
      </button>
    </div>
  );
}
