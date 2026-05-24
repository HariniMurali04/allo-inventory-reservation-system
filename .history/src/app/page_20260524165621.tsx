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
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Allo Inventory Reservation
        </h1>

        <div className="grid gap-6">

          {products.map((product) => (

            <div
              key={product.id}
              className="bg-white rounded-xl shadow p-6"
            >

              <h2 className="text-2xl font-semibold mb-4">
                {product.name}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                {product.warehouses.map(
                  (warehouse) => (

                    <div
                      key={
                        warehouse.warehouseId
                      }
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >

                      <div>

                        <p className="font-medium">
                          {
                            warehouse.warehouseName
                          }
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Available Stock:
                          {" "}
                          {
                            warehouse.availableStock
                          }
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
                        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
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