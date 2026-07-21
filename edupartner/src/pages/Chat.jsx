import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Plus, MessageCircle, Search, Trash2, 
    ChevronLeft, Sparkles, History, X, Menu 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function Chat() {
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [newChatTitle, setNewChatTitle] = useState('');
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [showMobileHistory, setShowMobileHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    const { data: sessions = [] } = useQuery({
        queryKey: ['chatSessions'],
        queryFn: () => base44.entities.ChatSession.list('-updated_date'),
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session');
        if (sessionId) {
            const session = sessions.find(s => s.id === sessionId);
            if (session) {
                setActiveSession(session);
                setMessages(session.messages || []);
            }
        }
    }, [sessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const createSessionMutation = useMutation({
        mutationFn: (title) => base44.entities.ChatSession.create({
            title: title || 'New Chat',
            messages: []
        }),
        onSuccess: (newSession) => {
            queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
            setActiveSession(newSession);
            setMessages([]);
            setShowNewDialog(false);
            setNewChatTitle('');
        }
    });

    const updateSessionMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ChatSession.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chatSessions'] }),
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (id) => base44.entities.ChatSession.delete(id),
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
            if (activeSession?.id === deletedId) {
                setActiveSession(null);
                setMessages([]);
            }
        }
    });

    const handleSendMessage = async (content, attachedFile) => {
        if (!activeSession) {
            const newSession = await createSessionMutation.mutateAsync(content.substring(0, 50));
            await sendMessageToSession(newSession, content, attachedFile);
            return;
        }
        await sendMessageToSession(activeSession, content, attachedFile);
    };

    const sendMessageToSession = async (session, content, attachedFile) => {
        const userMessage = {
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
            file_url: attachedFile?.url
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            let prompt = `You are a friendly and knowledgeable EduPartner AI assistant. Your goal is to help students understand concepts easily, even if they don't know the basics. 

Key guidelines:
- Explain concepts in simple, relatable terms using analogies and examples
- Break down complex topics into digestible chunks
- Use memorable mnemonics and memory tricks when helpful
- Be encouraging and patient
- If an image or file is provided, analyze it and help explain what's shown
- Format responses with markdown for better readability

Previous conversation context:
${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

User's question: ${content}`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: attachedFile?.url ? [attachedFile.url] : undefined,
                add_context_from_internet: true
            });

            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            const updatedMessages = [...newMessages, aiMessage];
            setMessages(updatedMessages);
            
            await updateSessionMutation.mutateAsync({
                id: session.id,
                data: {
                    messages: updatedMessages,
                    last_message: content.substring(0, 100)
                }
            });
        } catch (error) {
            console.error('Error getting AI response:', error);
        }
        
        setIsLoading(false);
    };

    const filteredSessions = sessions.filter(s => 
        s.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex bg-slate-950" style={{ height: '100dvh' }}>
            {/* Narrow Sidebar - Hidden on mobile */}
            <div className={cn(
                "hidden md:flex bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex-col transition-all duration-300",
                showSidebar ? "w-64" : "w-16"
            )}>
                <div className="p-3 border-b border-slate-800">
                    <Button 
                        onClick={() => setShowNewDialog(true)}
                        size="icon"
                        className={cn(
                            "rounded-lg bg-transparent hover:bg-slate-800 text-slate-400",
                            !showSidebar && "w-10 h-10"
                        )}
                        title="New chat"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <div className={cn("p-2", !showSidebar && "hidden")}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input 
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9 bg-slate-800 border-slate-700 text-white text-sm placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-1 pb-4">
                        {filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all",
                                    activeSession?.id === session.id 
                                        ? "bg-slate-800 text-white"
                                        : "hover:bg-slate-800 text-slate-400"
                                )}
                                onClick={() => {
                                    setActiveSession(session);
                                    setMessages(session.messages || []);
                                }}
                                title={session.title}
                            >
                                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                                {showSidebar && (
                                    <>
                                        <p className="text-xs font-medium truncate flex-1">{session.title}</p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSessionMutation.mutate(session.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-3 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-10 text-slate-400 hover:bg-slate-800"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-xl flex-shrink-0">
                    <button onClick={() => setShowMobileHistory(true)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <History className="w-4 h-4" />
                        <span className="text-sm truncate max-w-[140px]">{activeSession?.title || 'Chats'}</span>
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowNewDialog(true)}
                        className="text-slate-400 hover:bg-slate-800 h-8 w-8"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Mobile Chat History Drawer */}
                {showMobileHistory && (
                    <div className="md:hidden absolute inset-0 z-50 bg-slate-900 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                            <h3 className="font-semibold text-white">Chat History</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowMobileHistory(false)} className="h-8 w-8 text-slate-400">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all",
                                        activeSession?.id === session.id
                                            ? "bg-slate-700 text-white"
                                            : "hover:bg-slate-800 text-slate-400"
                                    )}
                                    onClick={() => {
                                        setActiveSession(session);
                                        setMessages(session.messages || []);
                                        setShowMobileHistory(false);
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                                    <p className="text-sm font-medium truncate flex-1">{session.title}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-500 hover:text-red-400 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSessionMutation.mutate(session.id);
                                            if (activeSession?.id === session.id) {
                                                setActiveSession(null);
                                                setMessages([]);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages — scrolls internally, no page scroll */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center px-4">What can I help with?</h2>
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl mx-auto py-4 sm:py-6 px-2 sm:px-4">
                            {messages.map((msg, idx) => (
                                <ChatMessage key={idx} message={msg} />
                            ))}
                            {isLoading && (
                                <ChatMessage message={{ role: 'assistant' }} isTyping />
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input — always visible at bottom */}
                <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-950/80 backdrop-blur-xl p-2 sm:p-4">
                    <div className="w-full max-w-3xl mx-auto">
                        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
                    </div>
                </div>
            </div>

            {/* New Chat Dialog */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start New Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Input
                            placeholder="Chat title (optional)"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => createSessionMutation.mutate(newChatTitle)}
                                className="bg-gradient-to-r from-violet-500 to-purple-600"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}