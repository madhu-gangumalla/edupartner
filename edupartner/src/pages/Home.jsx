import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Brain, BookOpen, Users, MessageCircle, Plus, 
    Sparkles, ArrowRight, Clock, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    const { data: recentChats = [] } = useQuery({
        queryKey: ['recentChats'],
        queryFn: () => base44.entities.ChatSession.list('-updated_date', 5),
    });

    const { data: notes = [] } = useQuery({
        queryKey: ['recentNotes'],
        queryFn: () => base44.entities.Note.list('-updated_date', 4),
    });

    const quickActions = [
        { 
            icon: MessageCircle, 
            title: 'Start Study Chat', 
            desc: 'Ask AI anything', 
            href: createPageUrl('Chat'),
            gradient: 'from-indigo-500 via-purple-500 to-pink-500'
        },
        { 
            icon: BookOpen, 
            title: 'My Notes', 
            desc: 'View & create notes', 
            href: createPageUrl('Notes'),
            gradient: 'from-violet-500 via-purple-500 to-indigo-500'
        },
        { 
            icon: Users, 
            title: 'Friends', 
            desc: 'Connect & share', 
            href: createPageUrl('Friends'),
            gradient: 'from-pink-500 via-purple-500 to-indigo-500'
        },
    ];

    return (
        <div className="min-h-screen relative">
            {/* Hero Section */}
            <div className="relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5" />
                
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">AI-Powered Learning</span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            Hey{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-xl mb-6 sm:mb-8">
                            Ready to ace your exams? I'm here to help you understand any concept, 
                            from simple to complex. Let's study together!
                        </p>

                        <Link to={createPageUrl('Chat')}>
                            <Button className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 shadow-xl shadow-indigo-500/30 group">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                Start Learning with AI
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <Link to={action.href}>
                                <Card className="group relative overflow-hidden border border-slate-800 bg-slate-900 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 cursor-pointer">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="p-6 flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                                            <action.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                                            <p className="text-sm text-slate-400">{action.desc}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-600 ml-auto group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Recent Chats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                Recent Conversations
                            </h2>
                            <Link to={createPageUrl('Chat')}>
                                <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                                    View all
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {recentChats.length > 0 ? (
                                recentChats.map((chat) => (
                                    <Link key={chat.id} to={`${createPageUrl('Chat')}?session=${chat.id}`}>
                                        <Card className="p-4 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-pink-500/20 to-yellow-500/20 flex items-center justify-center border border-cyan-500/20">
                                                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">{chat.title}</h4>
                                                    <p className="text-sm text-slate-400 truncate">{chat.last_message || 'No messages yet'}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <Card className="p-8 border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
                                    <MessageCircle className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                                    <p className="text-slate-300">No conversations yet</p>
                                    <p className="text-sm text-slate-500">Start chatting with AI to begin learning!</p>
                                </Card>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Notes */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Recent Notes
                            </h2>
                            <Link to={createPageUrl('Notes')}>
                                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                                    View all
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {notes.length > 0 ? (
                                notes.map((note) => (
                                    <Link key={note.id} to={`${createPageUrl('Notes')}?note=${note.id}`}>
                                        <Card className="p-4 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:shadow-lg transition-all cursor-pointer h-full">
                                            <h4 className="font-medium text-white line-clamp-1 mb-1">{note.title}</h4>
                                            <p className="text-xs text-slate-400 line-clamp-2">{note.content?.substring(0, 80)}</p>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <Card className="col-span-2 p-8 border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
                                    <BookOpen className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
                                    <p className="text-slate-300">No notes yet</p>
                                    <p className="text-sm text-slate-500">Create your first study note!</p>
                                </Card>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}