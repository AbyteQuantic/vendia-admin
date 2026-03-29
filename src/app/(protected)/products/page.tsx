"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductForm } from "@/components/forms/product-form";
import { useApi } from "@/hooks/use-api";
import { apiPost, apiPatch } from "@/lib/api";
import { formatCOP } from "@/lib/utils";
import type { Product } from "@/types/models";
import type { CreateProductRequest, UpdateProductRequest } from "@/types/api";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { data: products, error, isLoading, mutate } = useApi<Product[]>("/api/v1/products");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  const sorted = products?.slice().sort((a, b) => b.ID - a.ID) ?? [];
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(undefined);
  }

  async function handleCreate(data: CreateProductRequest | UpdateProductRequest) {
    await apiPost("/api/v1/products", data);
    await mutate();
    closeModal();
  }

  async function handleUpdate(data: CreateProductRequest | UpdateProductRequest) {
    if (!editing) return;
    await apiPatch(`/api/v1/products/${editing.ID}`, data);
    await mutate();
    closeModal();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500">
            Gestiona el inventario de tu tienda
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Crear producto
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : error ? (
        <ErrorState
          message="No se pudieron cargar los productos."
          onRetry={() => mutate()}
        />
      ) : !products?.length ? (
        <EmptyState
          title="No hay productos aún"
          description="Crea tu primer producto para empezar a vender."
          action={{ label: "Crear producto", onClick: openCreate }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCOP(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock < 5 ? "font-semibold text-red-600" : "text-gray-700"}>
                        {p.stock}
                      </span>
                      {p.stock < 5 && p.stock > 0 && (
                        <Badge variant="warning" className="ml-2">Bajo</Badge>
                      )}
                      {p.stock === 0 && (
                        <Badge variant="danger" className="ml-2">Agotado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.is_available ? "success" : "danger"}>
                        {p.is_available ? "Disponible" : "No disponible"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((p) => (
              <div key={p.ID} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{formatCOP(p.price)}</p>
                  </div>
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-sm ${p.stock < 5 ? "font-semibold text-red-600" : "text-gray-600"}`}>
                    Stock: {p.stock}
                  </span>
                  <Badge variant={p.is_available ? "success" : "danger"}>
                    {p.is_available ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} de {sorted.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Editar producto" : "Crear producto"}
      >
        <ProductForm
          product={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
