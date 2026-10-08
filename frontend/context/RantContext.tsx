"use client";

import axios from "axios";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

export type Rant = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: { id: string }[];
};

export type RantComment = {
  id: string;
  author: string;
  content: string;
  date: string;
};

type RantActions = {
  rants: Rant[];
  isLoading: boolean;
  feedError: Error | null;
  createRant: (rant: { title: string; content: string }) => Promise<Rant>;
  addComment: (rantId: string, content: string) => Promise<void>;
  likeRant: (rantId: string) => Promise<void>;
  unlikeRant: (rantId: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
};

type ApiRant = {
  r_id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: { displayName?: string | null };
  likes?: { l_id: string }[];
};

type ApiComment = {
  c_id: string;
  content: string;
  createdAt: string;
  commentedBy?: { displayName?: string | null };
};

const RANT_FEED_KEY = ["rants", "feed"] as const;
const rantCommentsKey = (rantId: string) =>
  ["rants", "comments", rantId] as const;
const RantActionsContext = createContext<RantActions | null>(null);

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_LOCAL_BACKEND_URL is not configured");
  }
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function authConfig(token: string | null) {
  if (!token) {
    throw new Error("You must be signed in to perform this action");
  }
  return { headers: { Authorization: `Bearer ${token}` } };
}

function toRant(rant: ApiRant): Rant {
  return {
    id: rant.r_id,
    title: rant.title,
    content: rant.content,
    author: rant.author?.displayName || "Anonymous",
    date: new Date(rant.createdAt).toLocaleString(),
    likes: (rant.likes || []).map((like) => ({ id: like.l_id })),
  };
}

function RantActionsProvider({ children }: { children: ReactNode }) {
  const { userToken } = useAuth();
  const queryClient = useQueryClient();
  const feedQuery = useQuery<Rant[], Error>({
    queryKey: RANT_FEED_KEY,
    queryFn: async () => {
      const response = await axios.get<ApiRant[]>(apiUrl("/rants"));
      return response.data.map(toRant);
    },
  });

  const createRantMutation = useMutation<
    Rant,
    Error,
    { title: string; content: string }
  >({
    mutationFn: async (rant) => {
      const response = await axios.post<ApiRant>(
        apiUrl("/rants"),
        rant,
        authConfig(userToken)
      );
      return toRant(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RANT_FEED_KEY });
    },
  });

  const addCommentMutation = useMutation<
    void,
    Error,
    { rantId: string; content: string }
  >({
    mutationFn: async ({ rantId, content }) => {
      await axios.post(
        apiUrl(`/comments/rants/${encodeURIComponent(rantId)}/comments`),
        { content },
        authConfig(userToken)
      );
    },
    onSuccess: async (_result, { rantId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rantCommentsKey(rantId) }),
        queryClient.invalidateQueries({ queryKey: RANT_FEED_KEY }),
      ]);
    },
  });

  const unlikeRantMutation = useMutation<void, Error, string>({
    mutationFn: async (rantId) => {
      await axios.delete(
        apiUrl(`/likes/rants/${encodeURIComponent(rantId)}/like`),
        authConfig(userToken)
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RANT_FEED_KEY });
    },
  });

  const likeRantMutation = useMutation<void, Error, string>({
    mutationFn: async (rantId) => {
      await axios.post(
        apiUrl(`/likes/rants/${encodeURIComponent(rantId)}/like`),
        {},
        authConfig(userToken)
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RANT_FEED_KEY });
    },
  });

  const value: RantActions = {
    rants: feedQuery.data || [],
    isLoading: feedQuery.isPending,
    feedError: feedQuery.error,
    createRant: createRantMutation.mutateAsync,
    addComment: async (rantId, content) => {
      await addCommentMutation.mutateAsync({ rantId, content });
    },
    likeRant: likeRantMutation.mutateAsync,
    unlikeRant: unlikeRantMutation.mutateAsync,
    refreshFeed: async () => {
      await queryClient.invalidateQueries({ queryKey: RANT_FEED_KEY });
    },
  };

  return (
    <RantActionsContext.Provider value={value}>
      {children}
    </RantActionsContext.Provider>
  );
}

export function RantProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RantActionsProvider>{children}</RantActionsProvider>
    </QueryClientProvider>
  );
}

export function useRantActions(): RantActions {
  const context = useContext(RantActionsContext);
  if (!context) {
    throw new Error("useRantActions must be used within a RantProvider");
  }
  return context;
}

export function useRantComments(rantId: string, enabled = true) {
  return useQuery<RantComment[], Error>({
    queryKey: rantCommentsKey(rantId),
    enabled: Boolean(rantId) && enabled,
    queryFn: async () => {
      const response = await axios.get<ApiComment[]>(
        apiUrl(`/comments/rants/${encodeURIComponent(rantId)}/comments`)
      );
      return response.data.map((comment) => ({
        id: comment.c_id,
        author: comment.commentedBy?.displayName || "Anonymous",
        content: comment.content,
        date: new Date(comment.createdAt).toLocaleString(),
      }));
    },
  });
}