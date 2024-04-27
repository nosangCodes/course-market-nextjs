// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/db";
import { z } from "zod";
import jwt from "jsonwebtoken";

type Data = {
  message: string;
  token?: string;
  error?: any;
};

const loginUserSchema = z.object({
  username: z.string().min(1).max(50).email(),
  password: z.string().min(1).max(50),
});

export const checkIfUserExixts = async (username: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
        password,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "POST") {
      const parsedData = loginUserSchema.safeParse(req.body);

      if (!parsedData.success) {
        throw parsedData.error;
      }

      const user = await checkIfUserExixts(
        parsedData.data?.username,
        parsedData.data.password
      );
      if (!user) {
        return res
          .status(401)
          .json({ message: "Incorrect username or password." });
      }

      const token = jwt.sign(
        { usernname: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: "4h" }
      );
      return res.status(201).json({ message: "logged in", token });
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
