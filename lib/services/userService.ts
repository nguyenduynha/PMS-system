import { prisma } from "../prisma";

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  return users.map((u) => ({
    id: u.id.toString(),
    fullName: u.fullName,
    email: u.email,
    phone: u.phoneNumber || "",
    role: u.role,
    status: u.status,
  }));
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  return {
    ...user,
    id: user.id.toString(),
  };
}

export async function createUser(data: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}) {
  const newUser = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phone,
      role: data.role,
      status: data.status,
      password: "123", // Default placeholder password for new staff
    },
  });
  return {
    ...newUser,
    id: newUser.id.toString(),
  };
}

export async function updateUser(
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  }
) {
  const updatedUser = await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phone,
      role: data.role,
      status: data.status,
    },
  });
  return {
    ...updatedUser,
    id: updatedUser.id.toString(),
  };
}

export async function deleteUser(id: string) {
  const deletedUser = await prisma.user.delete({
    where: { id: BigInt(id) },
  });
  return {
    ...deletedUser,
    id: deletedUser.id.toString(),
  };
}
