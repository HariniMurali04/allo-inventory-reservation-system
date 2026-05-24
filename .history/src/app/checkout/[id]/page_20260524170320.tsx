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
  <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 p-8">

    <div className="max-w-5xl mx-auto">

      <h1 className="text-5xl font-extrabold mb-10 text-center text-slate-800">
        Allo Inventory Reservation
      </h1>

      <div className="grid gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white"
          >

            <h2 className="text-2xl font-bold mb-5 text-slate-700">
              {product.name}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              {product.warehouses.map(
                (warehouse) => (

                  <div
                    key={warehouse.warehouseId}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between"
                  >

                    <div>

                      <p className="font-semibold text-slate-700">
                        {warehouse.warehouseName}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Available Stock:
                        {" "}
                        {warehouse.availableStock}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        reserveProduct(
                          product.id,
                          warehouse.warehouseId
                        )
                      }
                      disabled={
                        loading ||
                        warehouse.availableStock <= 0
                      }
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50"
                    >
                      Reserve
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        ))}

      </div>

    </div>

  </main>
);
}

  