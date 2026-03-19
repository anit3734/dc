import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ message: "Invalid input data", errors: parsed.error.format() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return Response.json({ message: "User created successfully", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration Error", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
