import prisma from "../db.js";

export async function getRecentStock() {
  return prisma.stock.findMany({
    orderBy: { date: "desc" },
   
  });
}
