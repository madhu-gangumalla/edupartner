import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, UserCheck, UserX, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FriendCard({ friend, onChat, onAccept, onReject, isPending }) {
    const initials = friend.friend_name 
        ? friend.friend_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : friend.friend_email[0].toUpperCase();

    return (
        <Card className="overflow-hidden border border-slate-800 bg-slate-900 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
            <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">{initials}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                        {friend.friend_name || friend.friend_email}
                    </h4>
                    <p className="text-sm text-slate-400 truncate">{friend.friend_email}</p>
                </div>
                
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => onAccept(friend)}
                        >
                            <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => onReject(friend)}
                        >
                            <UserX className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                        onClick={() => onChat(friend)}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                    </Button>
                )}
            </div>
        </Card>
    );
}