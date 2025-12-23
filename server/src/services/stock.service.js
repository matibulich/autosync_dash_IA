import prisma from "../db.js";

export async function getRecentStock(limit = 10) {
  return prisma.sale.findMany({
    orderBy: { date: "desc" },
    take: limit, //take define cuantos elementos traer
  });
}
