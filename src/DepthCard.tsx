import { useRef, type ReactNode } from "react";
export function DepthCard({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`${className} depth-card`}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(4px)`;
        e.currentTarget.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
        e.currentTarget.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}
