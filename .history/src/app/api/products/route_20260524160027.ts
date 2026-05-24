import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      warehouses: product.inventories.map((inventory) => ({
        warehouseId: inventory.warehouse.id,
        warehouseName: inventory.warehouse.name,
        availableStock:
          inventory.totalQuantity -
          inventory.reservedQuantity,
      })),
    }));

    return NextResponse.json(formattedProducts);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}