import { prisma } from "../prisma";
import type { ServiceCategory } from "../types";

function detectCategory(name: string): ServiceCategory {
  const normalized = name.toLowerCase();
  if (normalized.includes("ăn") || normalized.includes("breakfast") || normalized.includes("lunch") || normalized.includes("dinner") || normalized.includes("room service") || normalized.includes("bar")) {
    return "FOOD";
  }
  if (normalized.includes("spa") || normalized.includes("massage") || normalized.includes("facial") || normalized.includes("tắm")) {
    return "SPA";
  }
  if (normalized.includes("laundry") || normalized.includes("giặt") || normalized.includes("ủi")) {
    return "LAUNDRY";
  }
  if (normalized.includes("airport") || normalized.includes("sân bay") || normalized.includes("tour") || normalized.includes("đưa đón") || normalized.includes("xe")) {
    return "TRANSPORT";
  }
  return "OTHER";
}

export async function getAllServices() {
  const services = await prisma.service.findMany({
    orderBy: { id: "asc" },
  });
  return services.map((s) => ({
    id: s.id.toString(),
    name: s.name,
    price: Number(s.price),
    unit: s.unit || "lần",
    status: s.status,
    category: detectCategory(s.name),
  }));
}

export async function createService(data: {
  name: string;
  price: number;
  unit?: string;
  status?: string;
}) {
  const newService = await prisma.service.create({
    data: {
      name: data.name,
      price: data.price,
      unit: data.unit || "lần",
      status: data.status || "ACTIVE",
    },
  });
  return {
    ...newService,
    id: newService.id.toString(),
    price: Number(newService.price),
    category: detectCategory(newService.name),
  };
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    price?: number;
    unit?: string;
    status?: string;
  }
) {
  const updatedService = await prisma.service.update({
    where: { id: BigInt(id) },
    data: {
      name: data.name,
      price: data.price,
      unit: data.unit,
      status: data.status,
    },
  });
  return {
    ...updatedService,
    id: updatedService.id.toString(),
    price: Number(updatedService.price),
    category: detectCategory(updatedService.name),
  };
}

export async function deleteService(id: string) {
  const deletedService = await prisma.service.delete({
    where: { id: BigInt(id) },
  });
  return {
    ...deletedService,
    id: deletedService.id.toString(),
    price: Number(deletedService.price),
    category: detectCategory(deletedService.name),
  };
}
