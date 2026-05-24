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

        // Find inventory row
        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId,
              warehouseId,
            },
          });

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        // Calculate available stock
        const availableStock =
          inventory.totalQuantity -
          inventory.reservedQuantity;

        // Prevent overselling
        if (availableStock < quantity) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        // Increase reserved quantity
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedQuantity: {
              increment: quantity,
            },
          },
        });

        // Create reservation
        const newReservation =
          await tx.reservation.create({
            data: {
              inventoryId: inventory.id,
              quantity,
              status: "PENDING",
              expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
              ),
            },
          });

        return newReservation;
      });

    return NextResponse.json(reservation);

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        {
          error: "Not enough stock available",
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