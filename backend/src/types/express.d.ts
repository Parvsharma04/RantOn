declare global {
  namespace Express {
    interface Request {
      user?: { u_id: string };
    }
  }
}

export {};
