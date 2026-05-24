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

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {

    try {

      const response =
        await axios.get(
          "/api/products"
        );

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
        await axios.post(
          "/api/reservations",
          {
            productId,
            warehouseId,
            quantity: 1,
          }
        );

      router.push(
        `/checkout/${response.data.id}`
      );

    } catch (error: any) {

      if (
        error.response?.status === 409
      ) {

        alert(
          "Not enough stock available"
        );

      } else {

        alert(
          "Reservation failed"
        );
      }

    } finally {

      setLoading(false);
    }
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
                        {loading
                          ? "Reserving..."
                          : "Reserve"}
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