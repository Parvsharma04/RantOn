import { Request, Response } from "express";
import prisma from "../prismaClient";

type IdParams = { id: string };

export const likeRant = async (req: Request<IdParams>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const like = await prisma.like.create({
      data: { likedRantId: req.params.id, likedById: req.user.u_id },
    });
    res.json(like);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const unlikeRant = async (req: Request<IdParams>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.like.delete({
      where: {
        likedRantId_likedById: {
          likedRantId: req.params.id,
          likedById: req.user.u_id,
        },
      },
    });
    res.json({ message: "Unliked" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
