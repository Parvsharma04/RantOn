"use client";

import type React from "react";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

type Rant = {
  id: string;
  title: string;
  content: string;
  author?: string;
  date?: string;
  comments: Comment[];
  likes: Like[];
};

type Like = {
  id: string;
}

type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

export default function Home() {
  const auth = useAuth();
  const { user } = auth; 
  const [rants, setRants] = useState<Rant[]>([]);
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const [newRant, setNewRant] = useState({
    title: "",
    content: "",
  });

  const router = useRouter();
  const [activeRant, setActiveRant] = useState<string | null>(null);

  const handleAddRant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRant.title || !newRant.content) return;
    if (!user) {
      router.push(
        `/auth?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
   
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/rants`, 
      {
        title: newRant.title,
        content: newRant.content,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + auth.userToken, 
        }, 
    });
      
    const newPost = {
      id: response.data.r_id,
      title: response.data.title,
      content: response.data.content,
      author: auth.user?.displayName,
      date: new Date(response.data.createdAt).toLocaleString(),
      comments: [],
      likes: [],
    }

    setRants([newPost, ...rants]);
    setNewRant({ title: "", content: "" });
  };

  const handleAddComment = (discussionId: string) => {
    if (!newComments[discussionId]) return;

    const updatedDiscussions = rants.map((discussion) => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          comments: [
            ...discussion.comments,
            {
              id: String(discussion.comments.length + 1),
              author: "You",
              content: newComments[discussionId],
              date: "Just now",
            },
          ],
        };
      }
      return discussion;
    });

    setRants(updatedDiscussions);
    setNewComments({ ...newComments, [discussionId]: "" });
  };

  const handleShare = (discussionId: string) => {
    alert(
      `Link copied to clipboard! (This would actually copy a link to discussion #${discussionId} in a real app)`
    );
  };

  const toggleComments = (discussionId: string) => {
    setActiveRant(activeRant === discussionId ? null : discussionId);
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1
        className="text-2xl font-bold mb-8 text-center"
        style={{ color: "var(--primary)" }}
      >
        Rants
      </h1>

      <form
        onSubmit={handleAddRant}
        className="mb-8 p-4 border border-solid border-gray-200"
      >
        <h2 className="text-lg mb-4" style={{ color: "var(--primary)" }}>
          Start a Rant
        </h2>
        <input
          type="text"
          placeholder="Title"
          className="input mb-2"
          value={newRant.title}
          onChange={(e) => setNewRant({ ...newRant, title: e.target.value })}
        />
        <textarea
          placeholder="What's on your mind?"
          className="textarea mb-2"
          value={newRant.content}
          onChange={(e) => setNewRant({ ...newRant, content: e.target.value })}
        />
        <button type="submit" className="btn">
          Post Discussion
        </button>
      </form>

      <div className="space-y-6">
        {rants.map((discussion) => (
          <div
            key={discussion.id}
            className="rounded-lg border border-solid p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="text-lg font-bold">{discussion.title}</h2>
            <div
              className="mb-3 mt-2 h-1 w-12 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <p className="text-sm leading-6">{discussion.content}</p>
            <div
              className="mb-4 mt-3 h-px w-full opacity-40"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <div
              className="mb-2 flex items-center justify-between text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>
                {discussion.author} • {discussion.date}
              </span>
            </div>
            <div> 
              <div className="flex gap-4 justify-between py-2">
                <button
                  className="btn-text flex items-center gap-1"
                  onClick={()=>console.log('show likes')}
                >  
                  <Heart size={16} />
                  {discussion?.likes?.length}
                </button>
                <button
                  className="btn-text flex items-center gap-1"
                  onClick={() => toggleComments(discussion.id)}
                >
                  <MessageSquare size={16} />
                  {discussion.comments.length}
                </button>
                <button
                  className="btn-text flex items-center gap-1"
                  onClick={() => handleShare(discussion.id)}
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
            {activeRant === discussion.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {discussion.comments.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {discussion.comments.map((comment) => (
                      <div key={comment.id} className="text-sm p-2 bg-gray-50">
                        <p>{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.author} • {comment.date}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No comments yet</p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="input flex-1"
                    value={newComments[discussion.id] || ""}
                    onChange={(e) =>
                      setNewComments({
                        ...newComments,
                        [discussion.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    className="btn"
                    onClick={() => handleAddComment(discussion.id)}
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
