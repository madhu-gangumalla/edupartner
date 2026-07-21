import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
    Brain, Home, MessageCircle, BookOpen, Users, 
    LogOut, Menu, X, Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";
import AnimatedBackground from '@/components/AnimatedBackground';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'AI Chat', icon: MessageCircle, page: 'Chat' },
        { name: 'Notes', icon: BookOpen, page: 'Notes' },
        { name: 'Friends', icon: Users, page: 'Friends' },
    ];

    const isActive = (page) => currentPageName === page;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Animated Background */}
            <AnimatedBackground isHome={currentPageName === 'Home'} />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link to={createPageUrl('Home')} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">EduPartner AI</h1>
                            <p className="text-xs text-slate-400">AI Exam Prep</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.page} to={createPageUrl(item.page)}>
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive(item.page)
                                    ? "bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white shadow-lg shadow-cyan-500/30"
                                    : "text-slate-400 hover:bg-slate-800"
                            )}>
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                {user && (
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{user.full_name || 'User'}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-slate-300"
                                onClick={() => base44.auth.logout()}
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">End-to-end secure</span>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/70 backdrop-blur-2xl border-b border-slate-700/50 z-50 px-4 flex items-center justify-between">
                <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-white">EduPartner AI</span>
                </Link>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-slate-900 pt-16">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link 
                                key={item.page} 
                                to={createPageUrl(item.page)}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-4 rounded-xl transition-all",
                                    isActive(item.page)
                                        ? "bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 text-white"
                                        : "text-slate-400 hover:bg-slate-800"
                                )}>
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>
                    
                    {user && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{user.full_name || 'User'}</p>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                                onClick={() => base44.auth.logout()}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <main className={cn(
                "min-h-screen transition-all relative",
                "lg:ml-72",
                "pt-16 lg:pt-0",
                "pb-20 lg:pb-12"
            )}>
                <div className="relative z-10 w-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav currentPageName={currentPageName} />

            {/* Footer - Desktop only */}
            <footer className="hidden lg:flex fixed bottom-0 right-0 left-72 h-12 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 z-40 items-center justify-between px-6">
                <p className="text-xs text-slate-500">made by madhu</p>
                <p className="text-xs text-slate-500 italic">you may not be here but every step i take carries you with me - GB13</p>
            </footer>

        </div>
    );
}