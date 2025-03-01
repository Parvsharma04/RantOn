import { Request, Response } from "express";
import prisma from "../prismaClient";

export const likeRant = async (req: Request, res: Response) => {
  try {
    const like = await prisma.like.create({
      data: { likedRantId: req.params.id, likedById: (req as any).user.u_id },
    });
    res.json(like);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unlikeRant = async (req: Request, res: Response) => {
  try {
    await prisma.like.delete({
      where: {
        likedRantId_likedById: {
          likedRantId: req.params.id,
          likedById: (req as any).user.u_id,
        },
      },
    });
    res.json({ message: "Unliked" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
