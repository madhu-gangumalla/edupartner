import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, Mic, MicOff, Paperclip, X, Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

export default function ChatInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if ((!message.trim() && !attachedFile) || disabled) return;
        
        await onSend(message, attachedFile);
        setMessage('');
        setAttachedFile(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setAttachedFile({ url: file_url, name: file.name, type: file.type });
        } catch (err) {
            console.error('Upload failed:', err);
        }
        setIsUploading(false);
    };

    const toggleRecording = () => {
        if (!isRecording) {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        setIsRecording(true);
                        // Voice recording logic would go here
                        // For now, just toggle the state
                    })
                    .catch(err => {
                        console.error('Microphone access denied:', err);
                    });
            }
        } else {
            setIsRecording(false);
        }
    };

    return (
        <div className="w-full">
            {attachedFile && (
                <div className="mb-2 sm:mb-3 flex items-center gap-2 px-3 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    {attachedFile.type?.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-cyan-400" />
                    ) : (
                        <Paperclip className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="text-xs sm:text-sm text-cyan-300 flex-1 truncate">{attachedFile.name}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-cyan-400 hover:text-cyan-300"
                        onClick={() => setAttachedFile(null)}
                    >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-slate-700 bg-slate-800 hover:border-slate-600 focus-within:border-cyan-500 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-700 flex-shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                    </Button>
                    
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className="flex-1 min-h-[36px] sm:min-h-[40px] max-h-[150px] sm:max-h-[200px] resize-none border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 py-2 sm:py-2.5 text-sm sm:text-base"
                        disabled={disabled}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0 hidden sm:flex",
                            isRecording 
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                                : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700"
                        )}
                        onClick={toggleRecording}
                    >
                        {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </Button>

                    <Button
                        type="submit"
                        disabled={(!message.trim() && !attachedFile) || disabled}
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 disabled:opacity-50 flex-shrink-0"
                    >
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}