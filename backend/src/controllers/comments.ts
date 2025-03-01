import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getRantComments = async (req: Request, res: Response) => {
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

export const addComment = async (req: Request, res: Response) => {
  try {
    const comment = await prisma.comment.create({
      data: {
        ...req.body,
        commentedById: (req as any).user.u_id,
        rantId: req.params.id,
      },
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    await prisma.comment.delete({
      where: { c_id: req.params.id, commentedById: (req as any).user.u_id },
    });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
