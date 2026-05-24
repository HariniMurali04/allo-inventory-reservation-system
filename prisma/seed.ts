import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // Create Products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const samsung = await prisma.product.create({
    data: {
      name: "Samsung S24",
    },
  });

  // Create Warehouses
  const chennaiWarehouse = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
      location: "Chennai",
    },
  });

  const bangaloreWarehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  // Create Inventory Rows
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: chennaiWarehouse.id,
        totalQuantity: 10,
      },
      {
        productId: iphone.id,
        warehouseId: bangaloreWarehouse.id,
        totalQuantity: 5,
      },
      {
        productId: samsung.id,
        warehouseId: chennaiWarehouse.id,
        totalQuantity: 8,
      },
      {
        productId: samsung.id,
        warehouseId: bangaloreWarehouse.id,
        totalQuantity: 12,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });