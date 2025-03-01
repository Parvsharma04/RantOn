import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";

interface AuthenticatedRequest extends Request {
  user?: { u_id: string };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as unknown as {
      u_id: string;
    };

    const user = await prisma.user.findUnique({
      where: { u_id: decoded.u_id },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized: User not found" });
      return;
    }

    req.user = { u_id: user.u_id };
    next(); // Move to the next middleware
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};
