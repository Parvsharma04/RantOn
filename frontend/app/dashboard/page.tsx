"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";

type Rant = {
  id: string;
  title: string;
  content: string;
  likes: number;
};

type Comment = {
  id: string;
  content: string;
  rantId: string;
};

export default function Dashboard() {
  const [user, setUser] = useState(auth.currentUser);
  const [rants, setRants] = useState<Rant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesGiven, setLikesGiven] = useState(0);
  const [likesReceived, setLikesReceived] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Fetch user's rants, comments, and likes here
        // For now, we'll use mock data
        setRants([
          {
            id: "1",
            title: "My first rant",
            content: "This is a rant about...",
            likes: 5,
          },
          {
            id: "2",
            title: "Another rant",
            content: "I can't believe...",
            likes: 3,
          },
        ]);
        setComments([
          { id: "1", content: "Great point!", rantId: "3" },
          { id: "2", content: "I disagree...", rantId: "4" },
        ]);
        setLikesGiven(10);
        setLikesReceived(8);
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--primary)" }}
      >
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Rants</h2>
          {rants.map((rant) => (
            <div key={rant.id} className="mb-4 p-4 border border-gray-200">
              <h3 className="font-bold">{rant.title}</h3>
              <p className="text-sm text-gray-600">{rant.content}</p>
              <p className="text-sm text-gray-500 mt-2">Likes: {rant.likes}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Your Comments</h2>
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 p-4 border border-gray-200">
              <p className="text-sm text-gray-600">{comment.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                On Rant: {comment.rantId}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Likes</h2>
        <p>Likes Given: {likesGiven}</p>
        <p>Likes Received: {likesReceived}</p>
      </div>
    </div>
  );
}
