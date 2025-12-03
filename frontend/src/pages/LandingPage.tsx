import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

type Particle = {
    id: string;
    left: number;
    top: number;
    delay: number;
    size: number;
    red: boolean;
};

type Spark = {
    id: number;
    x: number;
    y: number;
    created: number;
};

export default function NovellaIntro() {
    const navigate = useNavigate();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [clicks, setClicks] = useState<Spark[]>([]);
    const [isLogoHover, setIsLogoHover] = useState(false);
    const [shinePct, setShinePct] = useState(50);
    const logoRef = useRef<HTMLHeadingElement | null>(null);

    useEffect(() => {
        const handleMove = (e: MouseEvent) =>
            setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    const particles = useMemo<Particle[]>(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: `p-${i}-${Math.floor(Math.random() * 100000)}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 6,
            size: 4 + Math.random() * 6,
            red: Math.random() > 0.6,
        }));
    }, []);

    const handleSpawnAtPointer = (clientX: number, clientY: number) => {
        const rect = document.body.getBoundingClientRect();
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setClicks((c) => [
            ...c,
            {
                id,
                x: Math.round(clientX - rect.left),
                y: Math.round(clientY - rect.top),
                created: Date.now(),
            },
        ]);
        setTimeout(
            () => setClicks((c) => c.filter((s) => s.id !== id)),
            1600
        );
    };

    const handleClick = (e: React.MouseEvent) => {
        handleSpawnAtPointer(e.clientX, e.clientY);
    };

    // 🔥 UPDATED HERE: Pressing Enter now navigates to /home
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") navigate("/home");
    };

    const handleLogoMove = (e: React.MouseEvent) => {
        const rect = logoRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setShinePct(pct);
    };

    const handleLogoEnter = (e: React.MouseEvent) => {
        setIsLogoHover(true);
        handleLogoMove(e);
    };

    const handleLogoLeave = () => setIsLogoHover(false);

    const word = "NOVELLA";
    const letters = word.split("");

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-red-900 via-black to-black text-white flex items-center justify-center focus:outline-none"
        >
            {/* Background effects */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ x: [0, -30, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute -top-20 left-0 w-[120%] h-56 bg-gradient-to-r from-red-700/30 via-white/10 to-transparent transform -skew-y-6 blur-xl" />
                <div className="absolute bottom-0 right-0 w-[110%] h-44 bg-gradient-to-l from-red-600/25 via-white/5 to-transparent transform skew-y-3 blur-2xl" />
            </motion.div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((p) => (
                    <motion.span
                        key={p.id}
                        className={`absolute rounded-full ${p.red ? "bg-red-400" : "bg-white/80"
                            }`}
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: p.size,
                            height: p.size,
                        }}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [-12, 12, -6], opacity: [0, 0.9, 0.15] }}
                        transition={{
                            delay: p.delay,
                            duration: 8 + p.size / 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Mouse glow */}
            <motion.div
                className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{ mixBlendMode: "screen" }}
                animate={{ x: mousePos.x - 210, y: mousePos.y - 210 }}
                transition={{ ease: "linear", duration: 0.25 }}
            >
                <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-r from-red-500/10 via-white/8 to-red-800/6" />
            </motion.div>

            {/* Pulsating Ring */}
            <div className="absolute z-10">
                <AnimatePresence>
                    <motion.div
                        key="ring"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeOut",
                        }}
                        className="w-[420px] h-[420px] rounded-full border border-white/5"
                    />
                </AnimatePresence>
            </div>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: "anticipate" }}
                className="flex flex-col items-center relative z-20"
            >
                <motion.h1
                    ref={logoRef}
                    onMouseMove={handleLogoMove}
                    onMouseEnter={handleLogoEnter}
                    onMouseLeave={handleLogoLeave}
                    className="relative text-7xl md:text-8xl font-extrabold tracking-widest cursor-default select-none"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                >
                    {letters.map((char, i) => {
                        const letterPct = ((i + 0.5) / letters.length) * 100;
                        const dist = Math.abs(letterPct - shinePct);
                        const intensity = Math.max(0, 1 - dist / 40);
                        const glow = Math.round(6 + intensity * 28);
                        const alpha = Math.min(1, 0.4 + intensity * 0.9);

                        const style: React.CSSProperties = isLogoHover
                            ? {
                                color: "#fff",
                                textShadow: `0 0 ${glow}px rgba(255,255,255,${alpha}), 0 0 ${glow / 2
                                    }px rgba(255,80,80,${alpha * 0.6})`,
                            }
                            : { color: "#fff" };

                        return (
                            <span key={i} className="px-1 inline-block" style={style}>
                                {char}
                            </span>
                        );
                    })}
                </motion.h1>

                <motion.div
                    className="mt-6 h-1 w-64 bg-gradient-to-r from-white to-red-400 rounded-full shadow-lg shadow-red-600/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }}
                />

                <motion.p
                    className="mt-6 text-lg md:text-xl tracking-wide text-white/80 max-w-xl text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 1 }}
                >
                    Your stories. Your world
                </motion.p>

                {/* CTA Enter */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7 }}
                >
                    <button
                        onClick={() => navigate("/home")}
                        className="px-6 py-2 rounded-full bg-white text-red-800 font-semibold shadow-md focus:ring-2 focus:ring-red-300"
                    >
                        Enter
                    </button>
                </motion.div>
            </motion.div>

            {/* Sparks */}
            <div className="absolute inset-0 pointer-events-none">
                {clicks.map((c) => (
                    <motion.div
                        key={c.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        style={{ left: c.x - 8, top: c.y - 8 }}
                        className="absolute w-4 h-4 rounded-full"
                    >
                        <span className="absolute inset-0 rounded-full bg-red-400/90 mix-blend-screen animate-pulse" />
                    </motion.div>
                ))}
            </div>

            <div className="absolute bottom-6 text-sm text-white/60">
                Click to spawn sparks • Press Enter to continue
            </div>
        </div>
    );
}
