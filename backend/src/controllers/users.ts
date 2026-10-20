import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import admin from "../firebase";
import prisma from "../prismaClient";

interface AuthenticatedRequest extends Request {
  user?: { u_id: string };
}

export const auth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: "Firebase ID token required" });
    return;
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId: uid },
      select: { username: true, usernameSet: true },
    });

    // Upsert user (create if not exists, update otherwise)
    const user = await prisma.user.upsert({
      where: { firebaseId: uid },
      update: {
        email: email || "",
        displayName:
          existingUser?.username ||
          (existingUser?.usernameSet ? "Anonymous" : name || ""),
        photoURL: picture || "",
      },
      create: {
        firebaseId: uid,
        email: email || "",
        displayName: name || "",
        photoURL: picture || "",
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { u_id: user.u_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      user,
      token,
      needsUsername:
        !existingUser?.usernameSet && !existingUser?.username,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const USERNAME_PATTERN = /^[a-z0-9._+-]{1,64}$/;
const BLOOM_SIZE = 1_000_003;
const BLOOM_HASHES = 7;

function normalizeUsername(value: unknown): string | null {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

function usernameHashes(value: string): number[] {
  let first = 2166136261;
  let second = 5381;
  for (let index = 0; index < value.length; index += 1) {
    first = Math.imul(first ^ value.charCodeAt(index), 16777619);
    second = Math.imul(second, 33) ^ value.charCodeAt(index);
  }
  return Array.from({ length: BLOOM_HASHES }, (_, index) => {
    const hash = (first + index * second) >>> 0;
    return hash % BLOOM_SIZE;
  });
}

async function usernameMayExist(username: string): Promise<boolean> {
  const users = await prisma.user.findMany({
    where: { username: { not: null } },
    select: { username: true },
  });
  const bits = new Uint8Array(BLOOM_SIZE);
  for (const user of users) {
    for (const hash of usernameHashes(user.username!.toLowerCase())) {
      bits[hash] = 1;
    }
  }
  return usernameHashes(username).every((hash) => bits[hash] === 1);
}

export const checkUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  const username = normalizeUsername(req.query.username);
  if (!username || !isValidUsername(username)) {
    res.status(400).json({
      available: false,
      error: "Username must be 1-64 characters and use letters, numbers, dots, underscores, plus signs, or hyphens",
    });
    return;
  }

  try {
    const maybeTaken = await usernameMayExist(username);
    const user = maybeTaken
      ? await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
          select: { u_id: true },
        })
      : null;
    res.json({ available: !user });
  } catch (error) {
    console.error("Username availability check failed:", error);
    res.status(500).json({ error: "Failed to check username availability" });
  }
};

export const updateUsername = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const username = normalizeUsername(req.body.username);
  if (username !== null && !isValidUsername(username)) {
    res.status(400).json({
      error: "Username must be 1-64 characters and use letters, numbers, dots, underscores, plus signs, or hyphens",
    });
    return;
  }

  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const account = await prisma.user.findUnique({
      where: { u_id: req.user.u_id },
      select: { email: true },
    });
    if (!account) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (username) {
      const maybeTaken = await usernameMayExist(username);
      const existing = maybeTaken
        ? await prisma.user.findFirst({
            where: {
              username: { equals: username, mode: "insensitive" },
              NOT: { u_id: req.user.u_id },
            },
            select: { u_id: true },
          })
        : null;
      if (existing) {
        res.status(409).json({ error: "Username is already taken" });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { u_id: req.user.u_id },
      data: {
        username,
        usernameSet: true,
        displayName: username || account.email.split("@")[0] || "Anonymous",
      },
      select: { u_id: true, username: true, displayName: true },
    });
    res.json(user);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Username is already taken" });
      return;
    }
    console.error("Username update failed:", error);
    res.status(500).json({ error: "Failed to update username" });
  }
};

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [rants, comments, likesGiven, likesReceived] = await Promise.all([
      prisma.rant.findMany({
        where: { authorId: req.user.u_id },
        include: { likes: true, _count: { select: { comments: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comment.findMany({
        where: { commentedById: req.user.u_id },
        include: { rant: { select: { r_id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.like.count({ where: { likedById: req.user.u_id } }),
      prisma.like.count({ where: { likedRant: { authorId: req.user.u_id } } }),
    ]);

    res.json({ rants, comments, likesGiven, likesReceived });
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const getUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { u_id: req.params.id },
      select: {
        u_id: true,
        displayName: true,
        username: true,
        photoURL: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
