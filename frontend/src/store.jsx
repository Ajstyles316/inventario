import { createContext, useContext, useMemo, useState } from "react";
import { crearDatosIniciales } from "./seed";

const KEY = "novastock-v1";
const StoreContext = createContext(null);

function leer() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const data = crearDatosIniciales();
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(leer);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("novastock-user") || "null");
    } catch {
      return null;
    }
  });
  const [flash, setFlash] = useState("");

  function persist(next) {
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function aviso(texto) {
    setFlash(texto);
    setTimeout(() => setFlash(""), 3500);
  }

  function login(username, password) {
    if (username === "admin" && password === "AdminInv2026!") {
      const u = { nombre: "admin", rol: "administrador" };
      sessionStorage.setItem("novastock-user", JSON.stringify(u));
      setUser(u);
      return true;
    }
    return false;
  }

  function loginGoogle() {
    const u = { nombre: "cuenta.gmail", rol: "operador" };
    sessionStorage.setItem("novastock-user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    sessionStorage.removeItem("novastock-user");
    setUser(null);
  }

  function stock(productoId) {
    return data.movimientos.reduce((acc, m) => {
      if (m.productoId !== productoId) return acc;
      return m.tipo === "ENTRADA" ? acc + m.cantidad : acc - m.cantidad;
    }, 0);
  }

  const value = useMemo(
    () => ({
      ...data,
      user,
      flash,
      esAdmin: user?.rol === "administrador",
      login,
      loginGoogle,
      logout,
      aviso,
      stock,
      guardarCategoria(cat) {
        const next = { ...data, categorias: [...data.categorias] };
        if (cat.id) {
          next.categorias = next.categorias.map((c) => (c.id === cat.id ? { ...c, ...cat } : c));
        } else {
          const id = next.nextIds.categoria;
          next.categorias.push({ ...cat, id, activo: true });
          next.nextIds = { ...next.nextIds, categoria: id + 1 };
        }
        persist(next);
        aviso("Categoría guardada.");
      },
      toggleCategoria(id) {
        persist({
          ...data,
          categorias: data.categorias.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c)),
        });
      },
      guardarProducto(prod) {
        const next = { ...data, productos: [...data.productos] };
        if (prod.id) {
          next.productos = next.productos.map((p) => (p.id === prod.id ? { ...p, ...prod } : p));
        } else {
          const id = next.nextIds.producto;
          next.productos.push({ ...prod, id, activo: true });
          next.nextIds = { ...next.nextIds, producto: id + 1 };
        }
        persist(next);
        aviso("Producto guardado. El stock sale de los movimientos.");
      },
      toggleProducto(id) {
        persist({
          ...data,
          productos: data.productos.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p)),
        });
      },
      registrarMovimiento(mov) {
        const disponible = stock(Number(mov.productoId));
        const cantidad = Number(mov.cantidad);
        if (mov.tipo === "SALIDA" && cantidad > disponible) {
          return `No hay stock suficiente. Disponible: ${disponible}.`;
        }
        const id = data.nextIds.movimiento;
        persist({
          ...data,
          movimientos: [
            {
              ...mov,
              id,
              productoId: Number(mov.productoId),
              cantidad,
              usuario: user.nombre,
              fecha: new Date().toISOString(),
            },
            ...data.movimientos,
          ],
          nextIds: { ...data.nextIds, movimiento: id + 1 },
        });
        aviso("Movimiento registrado. No se puede editar ni borrar.");
        return null;
      },
    }),
    [data, user, flash]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
