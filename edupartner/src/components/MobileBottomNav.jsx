import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, MessageCircle, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'AI Chat', icon: MessageCircle, page: 'Chat' },
    { name: 'Notes', icon: BookOpen, page: 'Notes' },
    { name: 'Friends', icon: Users, page: 'Friends' },
];

export default function MobileBottomNav({ currentPageName }) {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-700/60">
            <div className="flex items-center justify-around px-2 py-1 pb-safe">
                {navItems.map((item) => {
                    const isActive = currentPageName === item.page;
                    return (
                        <Link
                            key={item.page}
                            to={createPageUrl(item.page)}
                            className="flex-1 flex flex-col items-center py-2 px-1 relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <div className={cn(
                                "relative z-10 p-1.5 rounded-xl transition-all duration-300",
                                isActive ? "text-white" : "text-slate-500"
                            )}>
                                {isActive ? (
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.4 }}
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                                            <item.icon className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <item.icon className="w-5 h-5" />
                                )}
                            </div>
                            <span className={cn(
                                "relative z-10 text-[10px] font-medium transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent"
                                    : "text-slate-500"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}