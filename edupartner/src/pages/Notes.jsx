import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Plus, Search, BookOpen, X, Share2, 
    Sparkles, ArrowLeft, Save, Loader2 
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import NoteCard from '@/components/notes/NoteCard';
import ReactMarkdown from 'react-markdown';

export default function Notes() {
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [noteToShare, setNoteToShare] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', tags: [] });
    const [newTag, setNewTag] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes'],
        queryFn: () => base44.entities.Note.list('-updated_date'),
    });

    const { data: friends = [] } = useQuery({
        queryKey: ['friends'],
        queryFn: () => base44.entities.Friend.filter({ status: 'accepted' }),
    });

    const { data: sharedWithMe = [] } = useQuery({
        queryKey: ['sharedNotes'],
        queryFn: async () => {
            const user = await base44.auth.me();
            const allNotes = await base44.entities.Note.filter({ is_shared: true });
            return allNotes.filter(n => n.shared_with?.includes(user.email));
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const noteId = params.get('note');
        if (noteId && notes.length) {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                setSelectedNote(note);
            }
        }
    }, [notes]);

    const createNoteMutation = useMutation({
        mutationFn: (data) => base44.entities.Note.create(data),
        onSuccess: (newNote) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setSelectedNote(newNote);
            setIsEditing(true);
            setEditForm({ title: newNote.title, content: newNote.content, tags: newNote.tags || [] });
        }
    });

    const updateNoteMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setIsEditing(false);
        }
    });

    const deleteNoteMutation = useMutation({
        mutationFn: (id) => base44.entities.Note.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            setSelectedNote(null);
        }
    });

    const handleCreateNote = () => {
        createNoteMutation.mutate({
            title: 'Untitled Note',
            content: '',
            tags: []
        });
    };

    const handleSaveNote = () => {
        if (selectedNote) {
            updateNoteMutation.mutate({
                id: selectedNote.id,
                data: editForm
            });
        }
    };

    const handleShareNote = async () => {
        if (!noteToShare || !shareEmail) return;
        
        const currentShared = noteToShare.shared_with || [];
        if (!currentShared.includes(shareEmail)) {
            await updateNoteMutation.mutateAsync({
                id: noteToShare.id,
                data: {
                    is_shared: true,
                    shared_with: [...currentShared, shareEmail]
                }
            });
        }
        setShowShareDialog(false);
        setShareEmail('');
        setNoteToShare(null);
    };

    const handleAIImprove = async () => {
        if (!editForm.content) return;
        setIsGenerating(true);
        
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Improve and enhance these study notes. Make them clearer, add helpful explanations, and use markdown formatting for better readability. Keep the original structure but make it more comprehensive and easy to understand:

${editForm.content}`,
            });
            
            setEditForm(prev => ({ ...prev, content: response }));
        } catch (error) {
            console.error('Error improving notes:', error);
        }
        
        setIsGenerating(false);
    };

    const addTag = () => {
        if (newTag && !editForm.tags.includes(newTag)) {
            setEditForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setEditForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const filteredNotes = notes.filter(n => 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            My Notes
                        </h1>
                        <p className="text-slate-400 mt-2">Create, organize, and share your study notes</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input 
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <Button 
                            onClick={handleCreateNote}
                            className="h-11 px-5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Note
                        </Button>
                    </div>
                </div>

                {selectedNote ? (
                    /* Note Detail View */
                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                        <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent">
                            <Button 
                                variant="ghost" 
                                onClick={() => { setSelectedNote(null); setIsEditing(false); }}
                                className="text-slate-300 hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Notes
                            </Button>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleAIImprove}
                                            disabled={isGenerating}
                                            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4 mr-2" />
                                            )}
                                            AI Enhance
                                        </Button>
                                        <Button onClick={handleSaveNote} className="bg-gradient-to-r from-violet-500 to-purple-600">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button 
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditForm({ 
                                                title: selectedNote.title, 
                                                content: selectedNote.content,
                                                tags: selectedNote.tags || []
                                            });
                                        }}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {isEditing ? (
                                <div className="space-y-6">
                                    <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="text-2xl font-bold border-0 border-b border-slate-700 rounded-none px-0 focus:ring-0 bg-transparent text-white"
                                        placeholder="Note title..."
                                    />
                                    
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {editForm.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="bg-violet-500/20 text-violet-300 pl-3 border border-violet-500/30">
                                                {tag}
                                                <button onClick={() => removeTag(tag)} className="ml-2 hover:text-violet-200">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                placeholder="Add tag..."
                                                className="w-32 h-8 text-sm bg-slate-800 border-slate-700 text-white"
                                            />
                                            <Button size="sm" variant="outline" onClick={addTag} className="border-slate-700">Add</Button>
                                        </div>
                                    </div>

                                    <Textarea
                                        value={editForm.content}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                                        className="min-h-[400px] font-mono text-sm resize-none bg-slate-800 border-slate-700 text-white"
                                        placeholder="Write your notes here... (Markdown supported)"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">{selectedNote.title}</h2>
                                    {selectedNote.tags?.length > 0 && (
                                        <div className="flex gap-2 mb-6">
                                            {selectedNote.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="prose prose-invert max-w-none">
                                        <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Notes Grid */
                    <>
                        {/* My Notes */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">My Notes</h2>
                            {filteredNotes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredNotes.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onClick={setSelectedNote}
                                            onShare={(n) => { setNoteToShare(n); setShowShareDialog(true); }}
                                            onDelete={(n) => deleteNoteMutation.mutate(n.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-800">
                                    <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-white mb-2">No notes yet</h3>
                                    <p className="text-slate-400 mb-4">Create your first study note to get started</p>
                                    <Button onClick={handleCreateNote} className="bg-gradient-to-r from-violet-500 to-purple-600">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Note
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Shared with Me */}
                        {sharedWithMe.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-violet-400" />
                                    Shared with Me
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sharedWithMe.map((note) => (
                                        <NoteCard
                                            key={note.id}
                                            note={note}
                                            onClick={setSelectedNote}
                                            onShare={() => {}}
                                            onDelete={() => {}}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Share Dialog */}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div>
                            <Label>Share with friend</Label>
                            <Select value={shareEmail} onValueChange={setShareEmail}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select a friend" />
                                </SelectTrigger>
                                <SelectContent>
                                    {friends.map((friend) => (
                                        <SelectItem key={friend.id} value={friend.friend_email}>
                                            {friend.friend_name || friend.friend_email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleShareNote}
                                disabled={!shareEmail}
                                className="bg-gradient-to-r from-violet-500 to-purple-600"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}