"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/models";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/api";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel: () => void;
}

function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }
    if (stock === "" || Number(stock) < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        barcode: barcode.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        id="product-name"
        label="Nombre"
        placeholder="Coca-Cola 350ml"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="product-price"
          label="Precio (COP)"
          type="number"
          min="0"
          step="50"
          placeholder="2500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          id="product-stock"
          label="Stock"
          type="number"
          min="0"
          placeholder="100"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>

      <Input
        id="product-barcode"
        label="Código de barras (opcional)"
        placeholder="7702004000118"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
