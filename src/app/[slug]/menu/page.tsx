"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vendia-api.onrender.com";

interface Product {
  uuid: string;
  name: string;
  price: number;
  photo_url: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default function MenuPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [store, setStore] = useState<{ business_name: string; logo_url: string; is_open: boolean } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/store/${slug}/catalog`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          setStore({ business_name: json.data.business_name, logo_url: json.data.logo_url, is_open: json.data.is_open });
          setProducts(json.data.products || []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.uuid === p.uuid);
      if (existing) return prev.map(i => i.product.uuid === p.uuid ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const removeFromCart = (uuid: string) => {
    setCart(prev => prev.filter(i => i.product.uuid !== uuid));
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleOrder = async () => {
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/v1/store/${slug}/online-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          delivery_type: delivery,
          items: cart.map(i => ({
            product_id: i.product.uuid,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });
      setOrderDone(true);
    } catch {
      alert("Error al enviar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Pedido Enviado</h1>
          <p className="text-gray-600">
            {store?.business_name} recibio su pedido por {formatCOP(cartTotal)}.
            Le avisaremos por WhatsApp cuando este listo.
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Tienda no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">{store.business_name}</h1>
        <p className="text-sm text-gray-500">Catalogo en linea</p>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {products.map(p => (
          <div key={p.uuid} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {p.photo_url ? (
              <img src={p.photo_url} alt={p.name} className="w-full h-32 object-contain bg-gray-50" />
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold text-sm text-gray-800 line-clamp-2">{p.name}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-lg font-bold text-blue-700">{formatCOP(p.price)}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between shadow-lg z-20">
          <div>
            <p className="font-bold text-lg">{formatCOP(cartTotal)}</p>
            <p className="text-sm text-blue-200">{cart.reduce((s, i) => s + i.quantity, 0)} productos</p>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold"
          >
            Pedir
          </button>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tu Pedido</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>

            {/* Items */}
            {cart.map(item => (
              <div key={item.product.uuid} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-semibold">{item.quantity}x {item.product.name}</p>
                  <p className="text-sm text-gray-500">{formatCOP(item.product.price * item.quantity)}</p>
                </div>
                <button onClick={() => removeFromCart(item.product.uuid)} className="text-red-500 text-sm">Quitar</button>
              </div>
            ))}

            <div className="mt-4 mb-4 text-right">
              <p className="text-2xl font-bold text-blue-700">{formatCOP(cartTotal)}</p>
            </div>

            {/* Form */}
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Su nombre" className="w-full px-4 py-3 border rounded-xl mb-3 text-lg"
            />
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="WhatsApp / Celular" className="w-full px-4 py-3 border rounded-xl mb-3 text-lg"
            />

            <div className="flex gap-3 mb-4">
              {[["pickup", "Paso a recoger"], ["delivery", "Domicilio"]].map(([val, label]) => (
                <button key={val}
                  onClick={() => setDelivery(val)}
                  className={`flex-1 py-3 rounded-xl font-semibold border-2 ${
                    delivery === val ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {delivery === "delivery" && (
              <p className="text-xs text-gray-400 mb-4 text-center">
                El envio corre por cuenta del cliente. La tienda solo prepara el pedido.
              </p>
            )}

            <button
              onClick={handleOrder}
              disabled={!name || !phone || submitting}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xl font-bold disabled:opacity-40"
            >
              {submitting ? "Enviando..." : `Enviar Pedido ${formatCOP(cartTotal)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
