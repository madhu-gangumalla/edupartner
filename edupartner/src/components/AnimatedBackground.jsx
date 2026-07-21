import React from 'react';
import { motion } from 'framer-motion';

const orbs = [
    { size: 400, x: '10%', y: '15%', rgba: 'rgba(99,102,241,0.18)', duration: 18, delay: 0 },
    { size: 350, x: '70%', y: '60%', rgba: 'rgba(139,92,246,0.18)', duration: 22, delay: 3 },
    { size: 300, x: '50%', y: '10%', rgba: 'rgba(217,70,239,0.15)', duration: 20, delay: 6 },
    { size: 280, x: '85%', y: '20%', rgba: 'rgba(168,85,247,0.18)', duration: 25, delay: 2 },
    { size: 320, x: '20%', y: '75%', rgba: 'rgba(236,72,153,0.15)', duration: 19, delay: 8 },
];

const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
}));

export default function AnimatedBackground({ isHome = false }) {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

            {/* Animated orbs */}
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full bg-gradient-radial ${orb.color} blur-3xl`}
                    style={{
                        width: orb.size,
                        height: orb.size,
                        left: orb.x,
                        top: orb.y,
                        background: `radial-gradient(circle, ${orb.rgba} 0%, transparent 70%)`,
                    }}
                    animate={{
                        x: [0, 40, -30, 20, 0],
                        y: [0, -30, 40, -20, 0],
                        scale: [1, 1.15, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: orb.duration,
                        delay: orb.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Floating particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: p.opacity,
                    }}
                    animate={{
                        y: [0, -60, 0],
                        opacity: [p.opacity, p.opacity * 2.5, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            {/* Animated grid lines */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Radial vignette */}
            <div className="absolute inset-0 bg-radial-gradient opacity-60"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,6,23,0.8) 100%)'
                }}
            />

            {/* GB13 image overlay - only on non-Home pages */}
            {!isHome && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69734facd858e2f1013986be/a043d8d14_background.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.25,
                    }}
                />
            )}
        </div>
    );
}