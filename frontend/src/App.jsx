import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./store";
import Layout from "./Layout";
import {
  Alertas,
  Categorias,
  Inicio,
  Login,
  MovimientoForm,
  Movimientos,
  ProductoDetalle,
  ProductoForm,
  Productos,
} from "./pages";

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/nuevo" element={<ProductoForm />} />
            <Route path="/productos/:id" element={<ProductoDetalle />} />
            <Route path="/productos/:id/editar" element={<ProductoForm />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/movimientos/nuevo" element={<MovimientoForm />} />
            <Route path="/alertas" element={<Alertas />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
