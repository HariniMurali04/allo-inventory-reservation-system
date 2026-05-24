"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  warehouses: {
    warehouseId: string;
    warehouseName: string;
    availableStock: number;
  }[];
};

export default function HomePage() {

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {

    try {

      const response =
        await axios.get("/api/products");

      setProducts(response.data);

    } catch (error) {
      console.error(error);
    }
  }

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    try {

      setLoading(true);

      const response =
        await axios.post("/api/reservations", {
          productId,
          warehouseId,
          quantity: 1,
        });

      router.push(
        `/checkout/${response.data.id}`
      );

    } catch (error: any) {

      if (
        error.response?.status === 409
      ) {
        alert("Not enough stock available");
      } else {
        alert("Reservation failed");
      }

    } finally {
      setLoading(false);
    }
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