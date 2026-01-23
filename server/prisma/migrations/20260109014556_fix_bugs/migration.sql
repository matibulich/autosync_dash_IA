/*
  Warnings:

  - A unique constraint covering the columns `[product]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Stock_product_key` ON `Stock`(`product`);
