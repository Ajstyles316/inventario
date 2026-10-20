import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useStore } from "./store";

export default function Layout() {
  const { user, logout, flash, esAdmin, productos, movimientos, stock } = useStore();
  if (!user) return <Navigate to="/login" replace />;

  const alertas = productos.filter((p) => p.activo && stock(p.id) < p.stockMinimo).length;

  return (
    <div className="app-body">
      <aside className="sidebar">
        <NavLink className="brand" to="/">
          <span className="logo-mark" aria-hidden="true">N</span>
          <span>
            <strong className="brand-type">NovaStock</strong>
            <small>Inventario del negocio</small>
          </span>
        </NavLink>
        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span>
              <i className="bi bi-grid-1x2 me-2" />
              Inicio
            </span>
          </NavLink>
          <NavLink to="/productos" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>
              <i className="bi bi-box-seam me-2" />
              Productos
            </span>
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>
              <i className="bi bi-tags me-2" />
              Categorías
            </span>
          </NavLink>
          <NavLink to="/movimientos" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>
              <i className="bi bi-arrow-left-right me-2" />
              Movimientos
            </span>
          </NavLink>
          <NavLink to="/alertas" className={({ isActive }) => (isActive ? "active" : "")}>
            <span>
              <i className="bi bi-exclamation-triangle me-2" />
              Alertas
            </span>
            {alertas > 0 && <span className="badge-alerta">{alertas}</span>}
          </NavLink>
        </nav>
        <div className="side-foot">Rol: {esAdmin ? "Administrador" : "Operador"} · {movimientos.length} mov.</div>
      </aside>
      <div className="app-wrap">
        <header className="topbar">
          <div>
            <div className="muted small">Panel de control</div>
            <strong>Inventario</strong>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="muted">{user.nombre}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={logout}>
              Salir
            </button>
          </div>
        </header>
        <main className="content">
          {flash && <div className="alert alert-success">{flash}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
