"use client";

import type React from "react";

import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Rant = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  comments: Comment[];
};

type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
};

export default function Home() {
  const user = useAuth().user;
  const [rants, setRants] = useState<Rant[]>([
    {
      id: 1,
      title: "Minimalism in Web Design",
      content:
        "What are your thoughts on minimalist web design? I find it creates a better user experience.",
      author: "Alex",
      date: "2 hours ago",
      comments: [
        {
          id: 1,
          author: "Sam",
          content: "I agree. Less is more when it comes to user interfaces.",
          date: "1 hour ago",
        },
      ],
    },
    {
      id: 2,
      title: "Best Programming Languages for 2025",
      content:
        "Which programming languages do you think will be most relevant in the coming years?",
      author: "Taylor",
      date: "5 hours ago",
      comments: [],
    },
  ]);
  const [newComments, setNewComments] = useState<Record<number, string>>({});

  const [newRant, setNewRant] = useState({
    title: "",
    content: "",
  });

  const router = useRouter();
  const [activeRant, setActiveRant] = useState<number | null>(null);

  const handleAddRant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRant.title || !newRant.content) return;
    if (!user) {
      router.push(
        `/auth?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    const discussion: Rant = {
      id: rants.length + 1,
      title: newRant.title,
      content: newRant.content,
      author: "You",
      date: "Just now",
      comments: [],
    };

    setRants([discussion, ...rants]);
    setNewRant({ title: "", content: "" });
  };

  const handleAddComment = (discussionId: number) => {
    if (!newComments[discussionId]) return;

    const updatedDiscussions = rants.map((discussion) => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          comments: [
            ...discussion.comments,
            {
              id: discussion.comments.length + 1,
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

  const handleShare = (discussionId: number) => {
    alert(
      `Link copied to clipboard! (This would actually copy a link to discussion #${discussionId} in a real app)`
    );
  };

  const toggleComments = (discussionId: number) => {
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
            className="p-4 border border-solid border-gray-200"
          >
            <h2 className="text-lg font-bold mb-1">{discussion.title}</h2>
            <p className="text-sm mb-4">{discussion.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>
                {discussion.author} • {discussion.date}
              </span>
              <div className="flex gap-4">
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
