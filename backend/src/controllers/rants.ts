import { Request, Response } from "express";
import prisma from "../prismaClient";

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

export const getRant = async (req: Request, res: Response) => {
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
    const rant = await prisma.rant.create({
      data: { ...req.body, authorId: (req as any).user.u_id },
    });
    res.json(rant);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteRant = async (req: Request, res: Response) => {
  try {
    await prisma.rant.delete({
      where: { r_id: req.params.id, authorId: (req as any).user.u_id },
    });
    res.json({ message: "Rant deleted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
