"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const [reservation, setReservation] =
    useState<any>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  const router = useRouter();

  useEffect(() => {

    async function loadReservation() {

      const resolvedParams =
        await params;

      const response =
        await axios.get(
          `/api/reservations/${resolvedParams.id}`
        );

      setReservation(response.data);
    }

    loadReservation();

  }, [params]);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const diff =
        new Date(reservation.expiresAt)
          .getTime() -
        Date.now();

      if (diff <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(diff / 1000 / 60);

      const seconds =
        Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  async function confirmPurchase() {

    try {

      await axios.post(
        `/api/reservations/${reservation.id}/confirm`
      );

      alert("Purchase confirmed!");

      router.push("/");

    } catch (error: any) {

      if (
        error.response?.status === 410
      ) {
        alert("Reservation expired");
      } else {
        alert("Confirmation failed");
      }
    }
  }

  async function cancelReservation() {

    try {

      await axios.post(
        `/api/reservations/${reservation.id}/release`
      );

      alert("Reservation cancelled");

      router.push("/");

    } catch (error) {

      alert("Cancellation failed");
    }
  }

  if (!reservation) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Checkout
      </h1>

      <div className="border p-6 rounded-lg max-w-md">

        <p className="mb-4">
          Reservation ID:
          {" "}
          {reservation.id}
        </p>

        <p className="mb-4">
          Status:
          {" "}
          {reservation.status}
        </p>

        <p className="mb-6 text-red-500 font-semibold">
          Expires in:
          {" "}
          {timeLeft}
        </p>

        <div className="flex gap-4">

          <button
            onClick={confirmPurchase}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>

        </div>

      </div>

    </main>
  );
}