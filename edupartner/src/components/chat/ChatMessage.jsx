import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Bot, User, Image, FileText, Mic, Sparkles } from 'lucide-react';

export default function ChatMessage({ message, isTyping }) {
    const isUser = message.role === 'user';
    const isAI = message.role === 'assistant';

    return (
        <div className={cn(
            "flex gap-3 sm:gap-4 px-3 sm:px-6 py-4 sm:py-8",
            isUser ? "bg-transparent" : "bg-slate-900/30"
        )}>
            <div className={cn(
                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0",
                isUser ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" : "bg-slate-800"
            )}>
                {isUser ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                )}
            </div>
            
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                        "font-semibold text-sm",
                        isUser ? "text-white" : "text-white"
                    )}>
                        {isUser ? 'You' : 'EduPartner AI'}
                    </span>
                </div>
                
                {message.file_url && (
                    <div className="mb-3">
                        {message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                                src={message.file_url} 
                                alt="Uploaded" 
                                className="max-w-[200px] sm:max-w-xs w-full rounded-xl shadow-sm border border-slate-700"
                            />
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-xs sm:text-sm text-slate-300">Attached file</span>
                            </div>
                        )}
                    </div>
                )}
                
                <div className={cn(
                    "prose prose-sm max-w-none prose-invert break-words",
                    isUser ? "text-slate-300" : "text-slate-300"
                )}>
                    {isTyping ? (
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                    ) : (
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="mb-3 leading-relaxed text-slate-300">{children}</p>,
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-white">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                                code: ({ inline, children }) => inline ? (
                                    <code className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs font-mono">{children}</code>
                                ) : (
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 border border-slate-800">
                                        <code className="text-sm font-mono">{children}</code>
                                    </pre>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-cyan-500 pl-4 py-1 my-3 bg-cyan-500/10 rounded-r-lg">
                                        {children}
                                    </blockquote>
                                ),
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
}