"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, Share2 } from "lucide-react"

type Discussion = {
  id: number
  title: string
  content: string
  author: string
  date: string
  comments: Comment[]
}

type Comment = {
  id: number
  author: string
  content: string
  date: string
}

export default function Home() {
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      title: "Minimalism in Web Design",
      content: "What are your thoughts on minimalist web design? I find it creates a better user experience.",
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
      content: "Which programming languages do you think will be most relevant in the coming years?",
      author: "Taylor",
      date: "5 hours ago",
      comments: [],
    },
  ])

  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
  })

  const [newComments, setNewComments] = useState<Record<number, string>>({})
  const [activeDiscussion, setActiveDiscussion] = useState<number | null>(null)

  const handleAddDiscussion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDiscussion.title || !newDiscussion.content) return

    const discussion: Discussion = {
      id: discussions.length + 1,
      title: newDiscussion.title,
      content: newDiscussion.content,
      author: "You",
      date: "Just now",
      comments: [],
    }

    setDiscussions([discussion, ...discussions])
    setNewDiscussion({ title: "", content: "" })
  }

  const handleAddComment = (discussionId: number) => {
    if (!newComments[discussionId]) return

    const updatedDiscussions = discussions.map((discussion) => {
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
        }
      }
      return discussion
    })

    setDiscussions(updatedDiscussions)
    setNewComments({ ...newComments, [discussionId]: "" })
  }

  const handleShare = (discussionId: number) => {
    alert(`Link copied to clipboard! (This would actually copy a link to discussion #${discussionId} in a real app)`)
  }

  const toggleComments = (discussionId: number) => {
    setActiveDiscussion(activeDiscussion === discussionId ? null : discussionId)
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--primary)" }}>
        Discussions
      </h1>

      <form onSubmit={handleAddDiscussion} className="mb-8 p-4 border border-solid border-gray-200">
        <h2 className="text-lg mb-4" style={{ color: "var(--primary)" }}>
          Start a Discussion
        </h2>
        <input
          type="text"
          placeholder="Title"
          className="input mb-2"
          value={newDiscussion.title}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
        />
        <textarea
          placeholder="What's on your mind?"
          className="textarea mb-2"
          value={newDiscussion.content}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
        />
        <button type="submit" className="btn">
          Post Discussion
        </button>
      </form>

      <div className="space-y-6">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="p-4 border border-solid border-gray-200">
            <h2 className="text-lg font-bold mb-1">{discussion.title}</h2>
            <p className="text-sm mb-4">{discussion.content}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>
                {discussion.author} • {discussion.date}
              </span>
              <div className="flex gap-4">
                <button className="btn-text flex items-center gap-1" onClick={() => toggleComments(discussion.id)}>
                  <MessageSquare size={16} />
                  {discussion.comments.length}
                </button>
                <button className="btn-text flex items-center gap-1" onClick={() => handleShare(discussion.id)}>
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {activeDiscussion === discussion.id && (
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
                    onChange={(e) => setNewComments({ ...newComments, [discussion.id]: e.target.value })}
                  />
                  <button className="btn" onClick={() => handleAddComment(discussion.id)}>
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}

