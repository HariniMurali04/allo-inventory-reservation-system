import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const reservation =
      await prisma.$transaction(async (tx) => {

        // Atomic inventory update
        const updatedInventory =
          await tx.inventory.updateMany({
            where: {
              productId,
              warehouseId,
              totalQuantity: {
                gte: quantity,
              },
            },
            data: {
              totalQuantity: {
                decrement: quantity,
              },
              reservedQuantity: {
                increment: quantity,
              },
            },
          });

        // If no rows updated => insufficient stock
        if (updatedInventory.count === 0) {
          throw new Error(
            "INSUFFICIENT_STOCK"
          );
        }

        // Fetch inventory row
        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId,
              warehouseId,
            },
          });

        if (!inventory) {
          throw new Error(
            "INVENTORY_NOT_FOUND"
          );
        }

        // Create reservation
        const newReservation =
          await tx.reservation.create({
            data: {
              inventoryId: inventory.id,
              quantity,
              status: "PENDING",
              expiresAt: new Date(
                Date.now() +
                10 * 60 * 1000
              ),
            },
          });

        return newReservation;
      });

    return NextResponse.json(
      reservation
    );

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_STOCK"
    ) {

      return NextResponse.json(
        {
          error:
            "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Reservation failed",
      },
      {
        status: 500,
      }
    );
  }
}