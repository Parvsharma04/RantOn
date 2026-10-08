"use client";

import type React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  useRantActions,
  useRantComments,
  type Rant,
} from "@/context/RantContext";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const { rants, isLoading, feedError, createRant } = useRantActions();
  const [newRant, setNewRant] = useState({
    title: "",
    content: "",
  });
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddRant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRant.title.trim() || !newRant.content.trim()) return;
    if (!user) {
      router.push(
        `/auth?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    setActionError(null);
    try {
      await createRant(newRant);
      setNewRant({ title: "", content: "" });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to create rant"
      );
    }
  };

  const handleShare = (discussionId: string) => {
    alert(
      `Link copied to clipboard! (This would actually copy a link to discussion #${discussionId} in a real app)`
    );
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

      {actionError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {actionError}
        </p>
      )}
      {feedError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          Unable to load the feed: {feedError.message}
        </p>
      )}
      {isLoading && <p className="mb-4 text-sm">Loading rants...</p>}

      <div className="space-y-6">
        {rants.map((rant) => (
          <RantCard
            key={rant.id}
            rant={rant}
            onShare={handleShare}
            onSignIn={() =>
              router.push(
                `/auth?redirect=${encodeURIComponent(window.location.pathname)}`
              )
            }
            isSignedIn={Boolean(user)}
          />
        ))}
      </div>
    </main>
  );
}

function RantCard({
  rant,
  onShare,
  onSignIn,
  isSignedIn,
}: {
  rant: Rant;
  onShare: (rantId: string) => void;
  onSignIn: () => void;
  isSignedIn: boolean;
}) {
  const { addComment } = useRantActions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const commentsQuery = useRantComments(rant.id, isExpanded);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    if (!isSignedIn) {
      onSignIn();
      return;
    }

    setCommentError(null);
    try {
      await addComment(rant.id, comment.trim());
      setComment("");
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Unable to add comment"
      );
    }
  };

  const comments = commentsQuery.data || [];

  return (
    <div
      className="rounded-lg border border-solid p-4"
      style={{ borderColor: "var(--border)" }}
    >
      <h2 className="text-lg font-bold">{rant.title}</h2>
      <div
        className="mb-3 mt-2 h-1 w-12 rounded-full"
        style={{ backgroundColor: "var(--primary)" }}
      />
      <p className="text-sm leading-6">{rant.content}</p>
      <div
        className="mb-4 mt-3 h-px w-full opacity-40"
        style={{ backgroundColor: "var(--primary)" }}
      />
      <div
        className="mb-2 flex items-center justify-between text-xs"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span>
          {rant.author} • {rant.date}
        </span>
      </div>
      <div className="flex justify-between gap-4 py-2">
        <button className="btn-text flex items-center gap-1" type="button">
          <Heart size={16} />
          {rant.likes.length}
        </button>
        <button
          className="btn-text flex items-center gap-1"
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <MessageSquare size={16} />
          {comments.length}
        </button>
        <button
          className="btn-text flex items-center gap-1"
          type="button"
          onClick={() => onShare(rant.id)}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {commentsQuery.isLoading ? (
            <p className="mb-4 text-sm">Loading comments...</p>
          ) : commentsQuery.error ? (
            <p role="alert" className="mb-4 text-sm text-red-600">
              Unable to load comments: {commentsQuery.error.message}
            </p>
          ) : comments.length ? (
            <div className="mb-4 space-y-3">
              {comments.map((item) => (
                <div key={item.id} className="bg-gray-50 p-2 text-sm">
                  <p>{item.content}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.author} • {item.date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-500">No comments yet</p>
          )}
          {commentError && (
            <p role="alert" className="mb-2 text-sm text-red-600">
              {commentError}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="input flex-1"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <button
              className="btn"
              type="button"
              onClick={handleAddComment}
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
