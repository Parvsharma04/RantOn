"use client";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DashboardData = {
  rants: {
    r_id: string;
    title: string;
    content: string;
    createdAt: string;
    likes: { l_id: string }[];
    _count: { comments: number };
  }[];
  comments: {
    c_id: string;
    content: string;
    createdAt: string;
    rant: { r_id: string; title: string };
  }[];
  likesGiven: number;
  likesReceived: number;
};

export default function Dashboard() {
  const { user, loading, userToken, username, needsUsername } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    if (needsUsername) {
      router.push("/auth?redirect=%2Fdashboard");
      return;
    }
    if (!userToken) return;

    let cancelled = false;
    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL;
    if (!baseUrl) {
      setError("Dashboard API is not configured");
      return;
    }

    axios
      .get<DashboardData>(
        `${baseUrl.replace(/\/$/, "")}/users/dashboard`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      .then((response) => {
        if (!cancelled) setDashboard(response.data);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            axios.isAxiosError(requestError)
              ? requestError.response?.data?.error || requestError.message
              : "Failed to load dashboard"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, needsUsername, router, user, userToken]);

  if (loading || !user || needsUsername) {
    return (
      <div className="container mx-auto p-4">
        <p>{loading ? "Loading..." : "Redirecting..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4" role="alert">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
        Dashboard
      </h1>
      <p className="mb-6 text-gray-600">
        Signed in as {username || "Anonymous"}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold mb-4">Your Rants</h2>
          {dashboard.rants.length === 0 ? (
            <p className="text-gray-500">You haven&apos;t posted any rants yet.</p>
          ) : (
            dashboard.rants.map((rant) => (
              <article key={rant.r_id} className="mb-4 p-4 border border-gray-200">
                <h3 className="font-bold">{rant.title}</h3>
                <p className="text-sm text-gray-600">{rant.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {rant.likes.length} likes · {rant._count.comments} comments
                </p>
                <time className="text-xs text-gray-500">
                  {new Date(rant.createdAt).toLocaleString()}
                </time>
              </article>
            ))
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Your Comments</h2>
          {dashboard.comments.length === 0 ? (
            <p className="text-gray-500">You haven&apos;t commented on any rants yet.</p>
          ) : (
            dashboard.comments.map((comment) => (
              <article key={comment.c_id} className="mb-4 p-4 border border-gray-200">
                <p className="text-sm text-gray-600">{comment.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  On: {comment.rant.title}
                </p>
                <time className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </article>
            ))
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-bold mb-4">Likes</h2>
        <p>Likes Given: {dashboard.likesGiven}</p>
        <p>Likes Received: {dashboard.likesReceived}</p>
      </section>
    </main>
  );
}
