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

export const auth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  console.log(req.body);
  if (!idToken) {
    res.status(400).json({ error: "Firebase ID token required" });
    return;
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    console.log(decodedToken);

    // Upsert user (create if not exists, update otherwise)
    const user = await prisma.user.upsert({
      where: { firebaseId: uid },
      update: {
        email: email || "",
        displayName: name || "",
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

    res.json({ user, token });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

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
