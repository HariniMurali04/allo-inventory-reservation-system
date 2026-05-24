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
  <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">

      <h1 className="text-3xl font-bold mb-6">
        Checkout Reservation
      </h1>

      <div className="space-y-4">

        <div>
          <p className="text-sm text-gray-500">
            Reservation ID
          </p>

          <p className="font-medium break-all">
            {reservation.id}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="font-medium">
            {reservation.status}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Quantity
          </p>

          <p className="font-medium">
            {reservation.quantity}
          </p>
        </div>

        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">

          <p className="font-semibold">
            Expires In:
            {" "}
            {timeLeft}
          </p>

        </div>

        <div className="flex gap-4 pt-4">

          <button
            onClick={confirmPurchase}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  </main>
);

} 