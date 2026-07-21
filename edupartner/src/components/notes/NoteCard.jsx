import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Lock, MoreHorizontal, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NoteCard({ note, onClick, onShare, onDelete }) {
    return (
        <Card 
            className="group relative overflow-hidden border border-slate-800 bg-slate-900 hover:bg-gradient-to-br hover:from-slate-900 hover:to-slate-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/10"
            onClick={() => onClick(note)}
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white line-clamp-1 flex-1 pr-2">
                        {note.title}
                    </h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(note); }} className="text-slate-300">
                                <Share2 className="w-4 h-4 mr-2" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(note); }} className="text-red-400">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {note.content?.replace(/[#*`]/g, '').substring(0, 120)}...
                </p>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {note.is_shared ? (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0 text-xs">
                                <Share2 className="w-3 h-3 mr-1" /> Shared
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-0 text-xs">
                                <Lock className="w-3 h-3 mr-1" /> Private
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(note.updated_date || note.created_date), 'MMM d')}
                    </div>
                </div>
                
                {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}