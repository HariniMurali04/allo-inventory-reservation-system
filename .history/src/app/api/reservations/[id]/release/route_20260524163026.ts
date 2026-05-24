import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {

    const { id } = await context.params;

    const result =
      await prisma.$transaction(async (tx) => {

        const reservation =
          await tx.reservation.findUnique({
            where: {
              id,
            },
          });

        if (!reservation) {
          throw new Error("NOT_FOUND");
        }

        // Already released
        if (
          reservation.status === "RELEASED"
        ) {
          return reservation;
        }

        // Return stock
        await tx.inventory.update({
          where: {
            id: reservation.inventoryId,
          },
          data: {
            reservedQuantity: {
              decrement: reservation.quantity,
            },
          },
        });

        // Update reservation
        const updatedReservation =
          await tx.reservation.update({
            where: {
              id,
            },
            data: {
              status: "RELEASED",
            },
          });

        return updatedReservation;
      });

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Release failed",
      },
      {
        status: 500,
      }
    );
  }
}