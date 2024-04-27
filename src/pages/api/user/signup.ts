import prisma from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import jwt from "jsonwebtoken";

type Data = {
  message: string;
  token?: string;
  error?: any;
};

const createUserSchema = z.object({
  username: z.string().min(1).max(50).email(),
  password: z.string().min(1).max(50),
  userType: z.enum(["USER", "ADMIN"]).optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
      const parsedBody = createUserSchema.safeParse(req.body);

      if (!parsedBody.success) {
        throw parsedBody.error;
      }
      // const { password, username, userType } = parsedBody.data;
      const user = await prisma.user.create({ data: parsedBody.data });
      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET as string
      );
      return res.status(201).json({ message: "signup successfull", token });
    } else {
      return res.status(405).json({ message: "Bad method" });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request body" });
    }
    res.status(500).json({ message: "Internal server error." });
  }
}
