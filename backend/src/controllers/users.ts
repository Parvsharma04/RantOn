import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import admin from "../firebase";
import prisma from "../prismaClient";

interface AuthenticatedRequest extends Request {
  user?: { u_id: string };
}

interface AuthenticatedRequest extends Request {
  user?: { u_id: string };
}

// ✅ Check if a user exists and return JWT
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: "Firebase ID token required" });
    return;
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in our database
    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      res
        .status(404)
        .json({ error: "User does not exist. Please register first." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { u_id: user.u_id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: "Invalid Firebase token" });
  }
};

// ✅ Register a new user
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { idToken, username } = req.body;

  if (!idToken || !username) {
    res.status(400).json({ error: "Firebase ID token and username required" });
    return;
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId: uid },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists. Please log in." });
      return;
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        firebaseId: uid,
        email: email || "",
        displayName: name || "",
        username,
        photoURL: picture || "",
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { u_id: newUser.u_id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

// ✅ Get a user profile
export const getUser = async (req: Request, res: Response): Promise<void> => {
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

// ✅ Create a new user (on first login)
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firebaseId, email, displayName, username, photoURL } = req.body;

  if (!firebaseId || !email || !displayName || !username) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const newUser = await prisma.user.create({
      data: { firebaseId, email, displayName, username, photoURL },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// ✅ Update user info (authenticated)
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { displayName, username, photoURL } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { u_id: req.params.id },
      data: { displayName, username, photoURL },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};
