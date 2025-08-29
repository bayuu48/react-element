"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useId,
} from "react";

type CurvedLoopProps = {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: "left" | "right";
  interactive?: boolean;
};

const CurvedLoop: React.FC<CurvedLoopProps> = ({
  marqueeText = "",
  speed = 2,
  className,
  curveAmount = 400,
  direction = "left",
  interactive = true,
}) => {
  // teks diulang + spasi non-breaking
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText) + "\u00A0";
  }, [marqueeText]);

  // refs bertipe SVG
  const measureRef = useRef<SVGTextElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);

  // id aman untuk href (hapus ":" dari useId)
  const uid = useId();
  const safeUid = useMemo(() => uid.replace(/:/g, ""), [uid]);
  const pathId = `curve-${safeUid}`;

  // kurva (ubah lewat props curveAmount)
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;

  // drag state
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef<"left" | "right">(direction);
  const velRef = useRef(0);

  const textLength = spacing;
  const totalText = textLength ? Array(Math.ceil(1800 / textLength) + 2).fill(text).join("") : text;
  const ready = spacing > 0;

  // ukur panjang satu teks
  useEffect(() => {
    if (measureRef.current) {
      setSpacing(measureRef.current.getComputedTextLength());
    }
  }, [text, className]);

  // set offset awal biar mulainya halus
  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    const initial = -spacing;
    textPathRef.current.setAttribute("startOffset", initial + "px");
    setOffset(initial);
  }, [spacing]);

  // animasi jalan otomatis
  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;

    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
        let newOffset = currentOffset + delta;

        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;

        textPathRef.current.setAttribute("startOffset", newOffset + "px");
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  // handlers pointer (drag)
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!interactive || !dragRef.current || !textPathRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
    let newOffset = currentOffset + dx;

    const wrapPoint = spacing;
    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;

    textPathRef.current.setAttribute("startOffset", newOffset + "px");
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? "right" : "left";
  };

  const cursorStyle =
    interactive ? (dragRef.current ? "grabbing" as const : "grab" as const) : "auto" as const;

  return (
    <div
      className="curved-loop-jacket"
      style={{ visibility: ready ? "visible" : "hidden", cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="curved-loop-svg" viewBox="0 0 1440 120">
        {/* elemen pengukur panjang teks, disembunyiin */}
        <text
          ref={measureRef}
          xmlSpace="preserve"
          style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}
        >
          {text}
        </text>

        <defs>
          <path
            ref={pathRef}
            id={pathId}
            d={pathD}
            fill="none"
            stroke="transparent"
          />
        </defs>

        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath
              ref={textPathRef}
              href={`#${pathId}`}
              xlinkHref={`#${pathId}`} // fallback browser lama
              startOffset={offset + "px"}
              xmlSpace="preserve"
            >
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
};

export default CurvedLoop;
