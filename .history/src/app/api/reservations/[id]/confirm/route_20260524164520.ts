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

    const { id } =
      await context.params;

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

        // Expired reservation
        if (
          reservation.expiresAt <
          new Date()
        ) {
          throw new Error("EXPIRED");
        }

        // Already confirmed
        if (
          reservation.status ===
          "CONFIRMED"
        ) {
          return reservation;
        }

        // Remove reserved stock
        await tx.inventory.update({
          where: {
            id: reservation.inventoryId,
          },
          data: {
            reservedQuantity: {
              decrement:
                reservation.quantity,
            },
          },
        });

        // Confirm reservation
        const updatedReservation =
          await tx.reservation.update({
            where: {
              id,
            },
            data: {
              status: "CONFIRMED",
            },
          });

        return updatedReservation;
      });

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message === "EXPIRED"
    ) {

      return NextResponse.json(
        {
          error:
            "Reservation expired",
        },
        {
          status: 410,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Confirmation failed",
      },
      {
        status: 500,
      }
    );
  }
}