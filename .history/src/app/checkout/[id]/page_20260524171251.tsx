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

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  useEffect(() => {

    async function loadReservation() {

      try {

        const resolvedParams =
          await params;

        const response =
          await axios.get(
            `/api/reservations/${resolvedParams.id}`
          );

        setReservation(response.data);

      } catch (error) {

        alert(
          "Failed to load reservation"
        );
      }
    }

    loadReservation();

  }, [params]);

  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const diff =
        new Date(
          reservation.expiresAt
        ).getTime() -
        Date.now();

      if (diff <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(diff / 1000 / 60);

      const seconds =
        Math.floor(
          (diff / 1000) % 60
        );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [reservation]);

  async function confirmPurchase() {

    try {

      setLoading(true);

      await axios.post(
        `/api/reservations/${reservation.id}/confirm`
      );

      alert(
        "Purchase confirmed!"
      );

      router.push("/");

    } catch (error: any) {

      if (
        error.response?.status === 410
      ) {

        alert(
          "Reservation expired"
        );

      } else {

        alert(
          "Confirmation failed"
        );
      }

    } finally {

      setLoading(false);
    }
  }

  async function cancelReservation() {

    try {

      setLoading(true);

      await axios.post(
        `/api/reservations/${reservation.id}/release`
      );

      alert(
        "Reservation cancelled"
      );

      router.push("/");

    } catch (error) {

      alert(
        "Cancellation failed"
      );

    } finally {

      setLoading(false);
    }
  }

  if (!reservation) {

    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center p-8">

      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-lg border border-white">

        <h1 className="text-4xl font-extrabold mb-8 text-slate-800 text-center">
          Checkout Reservation
        </h1>

        <div className="space-y-5">

          <div>

            <p className="text-sm text-slate-500">
              Reservation ID
            </p>

            <p className="font-medium break-all text-slate-700">
              {reservation.id}
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Status
            </p>

            <p className="font-semibold text-purple-700">
              {reservation.status}
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Quantity
            </p>

            <p className="font-medium text-slate-700">
              {reservation.quantity}
            </p>

          </div>

          <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-4 py-4 rounded-2xl shadow-sm">

            <p className="font-bold text-lg">
              Expires In:
              {" "}
              {timeLeft}
            </p>

          </div>

          <div className="flex gap-4 pt-4">

            <button
              onClick={
                confirmPurchase
              }
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-2xl shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : "Confirm Purchase"}
            </button>

            <button
              onClick={
                cancelReservation
              }
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white py-3 rounded-2xl shadow-md transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}