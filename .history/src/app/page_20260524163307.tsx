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
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Products
      </h1>

      <div className="space-y-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="border p-4 rounded-lg"
          >

            <h2 className="text-xl font-semibold mb-4">
              {product.name}
            </h2>

            <div className="space-y-3">

              {product.warehouses.map((warehouse) => (

                <div
                  key={warehouse.warehouseId}
                  className="flex items-center justify-between border p-3 rounded"
                >

                  <div>
                    <p>
                      {warehouse.warehouseName}
                    </p>

                    <p className="text-sm text-gray-500">
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
                    className="bg-black text-white px-4 py-2 rounded"
                  >
                    Reserve
                  </button>

                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </main>
  );
}