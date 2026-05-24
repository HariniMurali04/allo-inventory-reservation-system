import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  try {

    // Find expired pending reservations
    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: new Date(),
          },
        },
      });

    // Release expired reservations
    for (const reservation of expiredReservations) {

      await prisma.$transaction(async (tx) => {

        // Return stock
        await tx.inventory.update({
          where: {
            id: reservation.inventoryId,
          },
          data: {
            totalQuantity: {
              increment:
                reservation.quantity,
            },
            reservedQuantity: {
              decrement:
                reservation.quantity,
            },
          },
        });

        // Mark reservation released
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
          },
        });

      });
    }

    // Fetch products
    const products =
      await prisma.product.findMany({
        include: {
          inventories: {
            include: {
              warehouse: true,
            },
          },
        },
      });

    // Format response
    const formattedProducts =
      products.map((product) => ({
        id: product.id,
        name: product.name,
        warehouses:
          product.inventories.map(
            (inventory) => ({
              warehouseId:
                inventory.warehouse.id,
              warehouseName:
                inventory.warehouse.name,
              availableStock:
                inventory.totalQuantity,
            })
          ),
      }));

    return NextResponse.json(
      formattedProducts
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}