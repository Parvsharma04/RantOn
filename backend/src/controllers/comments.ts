import { Request, Response } from "express";
import prisma from "../prismaClient";

type IdParams = { id: string };

export const getRantComments = async (req: Request<IdParams>, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { rantId: req.params.id },
      include: { commentedBy: true },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addComment = async (req: Request<IdParams>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        ...req.body,
        commentedById: req.user.u_id,
        rantId: req.params.id,
      },
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteComment = async (req: Request<IdParams>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.comment.delete({
      where: { c_id: req.params.id, commentedById: req.user.u_id },
    });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
