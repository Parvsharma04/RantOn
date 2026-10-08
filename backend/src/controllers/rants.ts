import { Request, Response } from "express";
import prisma from "../prismaClient";

type IdParams = { id: string };

export const getAllRants = async (req: Request, res: Response) => {
  try {
    const rants = await prisma.rant.findMany({
      include: { author: true, likes: true },
    });
    res.json(rants);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getRant = async (req: Request<IdParams>, res: Response) => {
  try {
    const rant = await prisma.rant.findUnique({
      where: { r_id: req.params.id },
      include: { comments: true, likes: true },
    });
    res.json(rant);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createRant = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, content } = req.body;
    const rant = await prisma.rant.create({
      data: { 
        title,
        content,
        authorId: req.user.u_id
      },
    });
    res.json(rant);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteRant = async (req: Request<IdParams>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.rant.delete({
      where: { r_id: req.params.id, authorId: req.user.u_id },
    });
    res.json({ message: "Rant deleted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
