import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Users, UserPlus, Search, Mail, Clock, 
    CheckCircle, XCircle, MessageCircle 
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FriendCard from '@/components/friends/FriendCard';

export default function Friends() {
    const [user, setUser] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();

    useEffect(() => {
        base44.auth.me().then(setUser);
    }, []);

    const { data: myFriends = [] } = useQuery({
        queryKey: ['myFriends'],
        queryFn: () => base44.entities.Friend.list(),
    });

    const { data: pendingRequests = [] } = useQuery({
        queryKey: ['pendingRequests'],
        queryFn: async () => {
            if (!user) return [];
            const allFriends = await base44.entities.Friend.filter({ 
                friend_email: user.email,
                status: 'pending'
            });
            return allFriends;
        },
        enabled: !!user
    });

    const addFriendMutation = useMutation({
        mutationFn: (email) => base44.entities.Friend.create({
            friend_email: email,
            status: 'pending'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myFriends'] });
            setShowAddDialog(false);
            setInviteEmail('');
        }
    });

    const updateFriendMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.Friend.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myFriends'] });
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
        }
    });

    const acceptedFriends = myFriends.filter(f => f.status === 'accepted');
    const sentPending = myFriends.filter(f => f.status === 'pending');

    const filteredFriends = acceptedFriends.filter(f => 
        f.friend_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.friend_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAccept = (friend) => {
        updateFriendMutation.mutate({ id: friend.id, status: 'accepted' });
        // Also create reverse friendship
        base44.entities.Friend.create({
            friend_email: friend.created_by,
            friend_name: friend.friend_name,
            status: 'accepted'
        });
    };

    const handleReject = (friend) => {
        updateFriendMutation.mutate({ id: friend.id, status: 'rejected' });
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            Friends
                        </h1>
                        <p className="text-slate-400 mt-2">Connect with study partners and share notes</p>
                    </div>
                    
                    <Button 
                        onClick={() => setShowAddDialog(true)}
                        className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add Friend
                    </Button>
                </div>

                <Tabs defaultValue="friends" className="space-y-6">
                    <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400">
                            <Users className="w-4 h-4 mr-2" />
                            Friends ({acceptedFriends.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400">
                            <Clock className="w-4 h-4 mr-2" />
                            Pending ({pendingRequests.length + sentPending.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input 
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                            />
                        </div>

                        {filteredFriends.length > 0 ? (
                            <div className="space-y-3">
                                {filteredFriends.map((friend) => (
                                    <FriendCard
                                        key={friend.id}
                                        friend={friend}
                                        onChat={(f) => {
                                            // Navigate to chat or start a chat session
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-800">
                                <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No friends yet</h3>
                                <p className="text-slate-400 mb-4">Add friends to share notes and study together</p>
                                <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Friend
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-6">
                        {/* Incoming Requests */}
                        {pendingRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-violet-400" />
                                    Incoming Requests
                                </h3>
                                <div className="space-y-3">
                                    {pendingRequests.map((friend) => (
                                        <FriendCard
                                            key={friend.id}
                                            friend={friend}
                                            isPending
                                            onAccept={handleAccept}
                                            onReject={handleReject}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sent Requests */}
                        {sentPending.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    Sent Requests
                                </h3>
                                <div className="space-y-3">
                                    {sentPending.map((friend) => (
                                        <FriendCard
                                            key={friend.id}
                                            friend={friend}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {pendingRequests.length === 0 && sentPending.length === 0 && (
                            <div className="bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-800">
                                <CheckCircle className="w-16 h-16 text-emerald-500/50 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                                <p className="text-slate-400">No pending friend requests</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Friend Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Friend</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <Label>Friend's Email</Label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="friend@example.com"
                                className="mt-2"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => addFriendMutation.mutate(inviteEmail)}
                                disabled={!inviteEmail || addFriendMutation.isPending}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Send Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}