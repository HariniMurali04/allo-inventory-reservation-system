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