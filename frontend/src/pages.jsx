import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useStore } from "./store";

const MOTIVOS = {
  ENTRADA: [
    ["COMPRA", "Compra"],
    ["INVENTARIO_INICIAL", "Inventario inicial"],
    ["CORRECCION", "Corrección"],
  ],
  SALIDA: [
    ["VENTA", "Venta"],
    ["MERMA", "Merma"],
    ["CORRECCION", "Corrección"],
  ],
};

function money(n) {
  return Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fecha(iso) {
  return new Date(iso).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" });
}

export function Login() {
  const { user, login, loginGoogle } = useStore();
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (!login(fd.get("username"), fd.get("password"))) setError("Usuario o contraseña incorrectos.");
  }

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <span className="logo-mark mb-3" style={{ width: 64, height: 64, fontSize: "1.6rem" }} aria-hidden="true">N</span>
        <h1 className="brand-type display-6">El inventario del negocio, con historial completo.</h1>
        <p className="mb-0">Versión estática para Render. Los datos se guardan en este navegador.</p>
      </section>
      <section className="auth-form">
        <div className="auth-card">
          <p className="muted mb-1">Bienvenido</p>
          <h2 className="brand-type h3 mb-4">Entra a NovaStock</h2>
          <button type="button" className="google-btn mb-3" onClick={loginGoogle}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="" />
            Continuar con Gmail
          </button>
          <p className="text-center muted small mb-3">En esta versión estática entra como Operador (demo, sin Google real).</p>
          <div className="text-center muted mb-3">o usa el administrador</div>
          <form onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input className="form-control" name="username" defaultValue="admin" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input className="form-control" type="password" name="password" defaultValue="AdminInv2026!" required />
            </div>
            <button className="btn btn-pine w-100" type="submit">
              Entrar como administrador
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export function Inicio() {
  const { productos, categorias, movimientos, stock } = useStore();
  const activos = productos.filter((p) => p.activo);
  const alertas = activos.filter((p) => stock(p.id) < p.stockMinimo);
  const hoy = new Date().toDateString();
  const movHoy = movimientos.filter((m) => new Date(m.fecha).toDateString() === hoy).length;
  const valor = activos.reduce((acc, p) => acc + p.precioCompra * stock(p.id), 0);

  return (
    <>
      <section className="hero">
        <p className="mb-1">NovaStock</p>
        <h1 className="display-6">Existencias claras, sin adivinar el stock.</h1>
        <p className="mb-0">Cada compra y cada venta queda en el historial.</p>
      </section>
      <div className="stat-grid">
        <div className="stat"><span>Productos activos</span><strong>{activos.length}</strong></div>
        <div className="stat"><span>Categorías</span><strong>{categorias.filter((c) => c.activo).length}</strong></div>
        <div className="stat"><span>Movimientos hoy</span><strong>{movHoy}</strong></div>
        <div className="stat"><span>Alertas de stock</span><strong>{alertas.length}</strong></div>
        <div className="stat"><span>Valor de compra en almacén</span><strong>${money(valor)}</strong></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel">
            <div className="panel-h d-flex justify-content-between">
              <strong>Últimos movimientos</strong>
              <Link to="/movimientos">Ver todos</Link>
            </div>
            <div className="panel-b">
              {movimientos.slice(0, 8).map((m) => {
                const p = productos.find((x) => x.id === m.productoId);
                return (
                  <div key={m.id} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <span className={`pill ${m.tipo === "ENTRADA" ? "pill-in" : "pill-out"}`}>{m.tipo}</span> {p?.nombre}
                      <div className="muted small">{m.motivo} · {m.usuario}</div>
                    </div>
                    <div className="text-end">
                      <strong>{m.cantidad}</strong>
                      <div className="muted small">{fecha(m.fecha)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="panel">
            <div className="panel-h d-flex justify-content-between">
              <strong>Stock bajo</strong>
              <Link to="/alertas">Alertas</Link>
            </div>
            <div className="panel-b">
              {alertas.slice(0, 6).map((p) => (
                <div key={p.id} className="d-flex justify-content-between py-2 border-bottom">
                  <Link to={`/productos/${p.id}`}>{p.nombre}</Link>
                  <span>{stock(p.id)} / mín. {p.stockMinimo}</span>
                </div>
              ))}
              {alertas.length === 0 && <p className="muted mb-0">Ningún producto activo está bajo el mínimo.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function Categorias() {
  const { categorias, productos, esAdmin, guardarCategoria, toggleCategoria } = useStore();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("activas");
  const [edit, setEdit] = useState(null);

  const lista = categorias.filter((c) => {
    const texto = (c.nombre + c.descripcion).toLowerCase().includes(q.toLowerCase());
    if (estado === "activas") return texto && c.activo;
    if (estado === "inactivas") return texto && !c.activo;
    return texto;
  });

  function onSave(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    guardarCategoria({
      id: edit?.id,
      nombre: fd.get("nombre"),
      descripcion: fd.get("descripcion"),
      imagen: fd.get("imagen"),
    });
    setEdit(null);
  }

  if (edit) {
    return (
      <div className="panel" style={{ maxWidth: 640 }}>
        <div className="panel-b">
          <h1 className="h4">{edit.id ? "Editar categoría" : "Nueva categoría"}</h1>
          <form onSubmit={onSave}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="nombre" defaultValue={edit.nombre || ""} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" name="descripcion" rows="3" defaultValue={edit.descripcion || ""} />
            </div>
            <div className="mb-3">
              <label className="form-label">URL de imagen</label>
              <input className="form-control" name="imagen" defaultValue={edit.imagen || ""} />
            </div>
            <button className="btn btn-pine" type="submit">Guardar</button>
            <button className="btn btn-outline-secondary ms-2" type="button" onClick={() => setEdit(null)}>Cancelar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
        <p className="muted mb-0">No se eliminan: se desactivan.</p>
        {esAdmin && <button className="btn btn-pine" onClick={() => setEdit({})}>Nueva categoría</button>}
      </div>
      <form className="panel panel-b mb-4 d-flex flex-wrap gap-2" onSubmit={(e) => e.preventDefault()}>
        <input className="form-control" style={{ maxWidth: 280 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar categoría" />
        <select className="form-select" style={{ maxWidth: 180 }} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
          <option value="todas">Todas</option>
        </select>
      </form>
      <div className="card-grid">
        {lista.map((c) => (
          <article className="cat-card" key={c.id}>
            {c.imagen && <img src={c.imagen} alt={c.nombre} />}
            <div className="body">
              <div className="d-flex justify-content-between">
                <h2 className="h5 mb-1">{c.nombre}</h2>
                <span className={`pill ${c.activo ? "pill-on" : "pill-off"}`}>{c.activo ? "Activa" : "Inactiva"}</span>
              </div>
              <p className="muted small">{c.descripcion}</p>
              <p className="small mb-3">{productos.filter((p) => p.categoriaId === c.id && p.activo).length} productos</p>
              {esAdmin && (
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setEdit(c)}>Editar</button>
                  <button className="btn btn-sm btn-outline-warning" onClick={() => toggleCategoria(c.id)}>
                    {c.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function Productos() {
  const { productos, categorias, esAdmin, stock } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [estado, setEstado] = useState("activos");
  const lista = productos.filter((p) => {
    const ok = (p.nombre + p.codigo).toLowerCase().includes(q.toLowerCase());
    const c = !cat || String(p.categoriaId) === cat;
    if (estado === "activos") return ok && c && p.activo;
    if (estado === "inactivos") return ok && c && !p.activo;
    return ok && c;
  });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
        <p className="muted mb-0">El stock se calcula con entradas menos salidas.</p>
        {esAdmin && <Link className="btn btn-pine" to="/productos/nuevo">Nuevo producto</Link>}
      </div>
      <form className="panel panel-b mb-4 d-flex flex-wrap gap-2" onSubmit={(e) => e.preventDefault()}>
        <input className="form-control" style={{ maxWidth: 240 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o código" />
        <select className="form-select" style={{ maxWidth: 200 }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: 160 }} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </form>
      <div className="panel">
        <table className="table align-middle mb-0">
          <thead>
            <tr><th /><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>P. venta</th><th /></tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const s = stock(p.id);
              const categoria = categorias.find((c) => c.id === p.categoriaId);
              return (
                <tr key={p.id}>
                  <td style={{ width: 72 }}>{p.imagen && <img className="rounded" src={p.imagen} alt="" width="56" height="56" style={{ objectFit: "cover" }} />}</td>
                  <td>
                    <Link to={`/productos/${p.id}`}><strong>{p.nombre}</strong></Link>
                    <div className="muted small">{p.codigo} {!p.activo && <span className="pill pill-off">Inactivo</span>} {s < p.stockMinimo && <span className="pill pill-out">Bajo</span>}</div>
                  </td>
                  <td>{categoria?.nombre}</td>
                  <td><strong>{s}</strong></td>
                  <td>{p.stockMinimo}</td>
                  <td>${money(p.precioVenta)}</td>
                  <td className="text-end"><Link className="btn btn-sm btn-outline-secondary" to={`/productos/${p.id}`}>Ver</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ProductoForm() {
  const { productos, categorias, guardarProducto, esAdmin } = useStore();
  const { id } = useParams();
  const nav = useNavigate();
  const actual = id ? productos.find((p) => p.id === Number(id)) : null;
  if (!esAdmin) return <Navigate to="/productos" replace />;

  function onSave(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    guardarProducto({
      id: actual?.id,
      codigo: fd.get("codigo"),
      nombre: fd.get("nombre"),
      descripcion: fd.get("descripcion"),
      categoriaId: Number(fd.get("categoriaId")),
      precioCompra: Number(fd.get("precioCompra")),
      precioVenta: Number(fd.get("precioVenta")),
      stockMinimo: Number(fd.get("stockMinimo")),
      imagen: fd.get("imagen"),
    });
    nav("/productos");
  }

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <div className="panel-b">
        <h1 className="h4">{actual ? "Editar producto" : "Nuevo producto"}</h1>
        <form onSubmit={onSave}>
          {[["codigo", "Código", actual?.codigo], ["nombre", "Nombre", actual?.nombre]].map(([name, label, val]) => (
            <div className="mb-3" key={name}>
              <label className="form-label">{label}</label>
              <input className="form-control" name={name} defaultValue={val || ""} required />
            </div>
          ))}
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="descripcion" rows="3" defaultValue={actual?.descripcion || ""} />
          </div>
          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <select className="form-select" name="categoriaId" defaultValue={actual?.categoriaId || ""} required>
              <option value="">Elige…</option>
              {categorias.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Precio compra</label>
            <input className="form-control" type="number" step="0.01" name="precioCompra" defaultValue={actual?.precioCompra ?? 0} />
          </div>
          <div className="mb-3">
            <label className="form-label">Precio venta</label>
            <input className="form-control" type="number" step="0.01" name="precioVenta" defaultValue={actual?.precioVenta ?? 0} />
          </div>
          <div className="mb-3">
            <label className="form-label">Stock mínimo</label>
            <input className="form-control" type="number" name="stockMinimo" defaultValue={actual?.stockMinimo ?? 5} />
          </div>
          <div className="mb-3">
            <label className="form-label">URL de imagen</label>
            <input className="form-control" name="imagen" defaultValue={actual?.imagen || ""} />
          </div>
          <button className="btn btn-pine" type="submit">Guardar</button>
          <Link className="btn btn-outline-secondary ms-2" to="/productos">Cancelar</Link>
        </form>
      </div>
    </div>
  );
}

export function ProductoDetalle() {
  const { productos, categorias, movimientos, stock, esAdmin, toggleProducto } = useStore();
  const { id } = useParams();
  const p = productos.find((x) => x.id === Number(id));
  if (!p) return <p>Producto no encontrado.</p>;
  const s = stock(p.id);
  const cat = categorias.find((c) => c.id === p.categoriaId);
  const hist = movimientos.filter((m) => m.productoId === p.id);

  return (
    <div className="row g-4">
      <div className="col-lg-4">
        <div className="panel">
          {p.imagen && <img src={p.imagen} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />}
          <div className="panel-b">
            <div className="muted">{p.codigo} · {cat?.nombre}</div>
            <p>{p.descripcion}</p>
            <p>Stock actual: <strong>{s}</strong> (mínimo {p.stockMinimo})</p>
            <p>Compra ${money(p.precioCompra)} · Venta ${money(p.precioVenta)}</p>
            <span className={`pill ${p.activo ? "pill-on" : "pill-off"}`}>{p.activo ? "Activo" : "Inactivo"}</span>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <Link className="btn btn-pine btn-sm" to={`/movimientos/nuevo?producto=${p.id}`}>Registrar movimiento</Link>
              {esAdmin && (
                <>
                  <Link className="btn btn-outline-secondary btn-sm" to={`/productos/${p.id}/editar`}>Editar</Link>
                  <button className="btn btn-outline-warning btn-sm" onClick={() => toggleProducto(p.id)}>
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="panel">
          <div className="panel-h"><strong>Historial (no se edita ni se borra)</strong></div>
          <table className="table mb-0">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Cant.</th><th>Motivo</th><th>Usuario</th></tr></thead>
            <tbody>
              {hist.map((m) => (
                <tr key={m.id}>
                  <td>{fecha(m.fecha)}</td>
                  <td>{m.tipo}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo}</td>
                  <td>{m.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Movimientos() {
  const { movimientos, productos } = useStore();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const lista = movimientos.filter((m) => {
    const p = productos.find((x) => x.id === m.productoId);
    const ok = !q || `${p?.nombre} ${p?.codigo}`.toLowerCase().includes(q.toLowerCase());
    return ok && (!tipo || m.tipo === tipo);
  });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-4">
        <p className="muted mb-0">Si hay un error, registra una corrección.</p>
        <Link className="btn btn-pine" to="/movimientos/nuevo">Nuevo movimiento</Link>
      </div>
      <form className="panel panel-b mb-4 d-flex flex-wrap gap-2" onSubmit={(e) => e.preventDefault()}>
        <input className="form-control" style={{ maxWidth: 240 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Producto o código" />
        <select className="form-select" style={{ maxWidth: 180 }} value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SALIDA">Salidas</option>
        </select>
      </form>
      <div className="panel">
        <table className="table mb-0">
          <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead>
          <tbody>
            {lista.map((m) => {
              const p = productos.find((x) => x.id === m.productoId);
              return (
                <tr key={m.id}>
                  <td>{fecha(m.fecha)}</td>
                  <td><Link to={`/productos/${m.productoId}`}>{p?.nombre}</Link></td>
                  <td><span className={`pill ${m.tipo === "ENTRADA" ? "pill-in" : "pill-out"}`}>{m.tipo}</span></td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo}</td>
                  <td>{m.usuario}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function MovimientoForm() {
  const { productos, registrarMovimiento, stock } = useStore();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [tipo, setTipo] = useState("ENTRADA");
  const [error, setError] = useState("");
  const pre = params.get("producto") || "";

  function onSave(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const err = registrarMovimiento({
      productoId: fd.get("productoId"),
      tipo: fd.get("tipo"),
      cantidad: fd.get("cantidad"),
      motivo: fd.get("motivo"),
      observacion: fd.get("observacion"),
    });
    if (err) {
      setError(err);
      return;
    }
    nav("/movimientos");
  }

  return (
    <div className="panel" style={{ maxWidth: 640 }}>
      <div className="panel-b">
        <h1 className="h4">Registrar entrada o salida</h1>
        <p className="muted">Una salida no puede ser mayor al stock disponible.</p>
        <form onSubmit={onSave}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label className="form-label">Producto</label>
            <select className="form-select" name="productoId" defaultValue={pre} required>
              <option value="">Elige…</option>
              {productos.filter((p) => p.activo).map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.nombre} (stock {stock(p.id)})</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select className="form-select" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Cantidad</label>
            <input className="form-control" type="number" min="1" name="cantidad" defaultValue="1" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Motivo</label>
            <select className="form-select" name="motivo">
              {MOTIVOS[tipo].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Observación</label>
            <textarea className="form-control" name="observacion" rows="2" />
          </div>
          <button className="btn btn-pine" type="submit">Registrar</button>
          <Link className="btn btn-outline-secondary ms-2" to="/movimientos">Cancelar</Link>
        </form>
      </div>
    </div>
  );
}

export function Alertas() {
  const { productos, categorias, stock } = useStore();
  const lista = useMemo(
    () => productos.filter((p) => p.activo && stock(p.id) < p.stockMinimo),
    [productos, stock]
  );

  return (
    <>
      <p className="muted">Estos productos activos tienen menos piezas que su stock mínimo.</p>
      <div className="card-grid">
        {lista.map((p) => (
          <article className="cat-card" key={p.id}>
            {p.imagen && <img src={p.imagen} alt="" />}
            <div className="body">
              <h2 className="h5">{p.nombre}</h2>
              <p className="muted small">{p.codigo} · {categorias.find((c) => c.id === p.categoriaId)?.nombre}</p>
              <p>Stock <strong>{stock(p.id)}</strong> · mínimo {p.stockMinimo}</p>
              <Link className="btn btn-sm btn-clay" to={`/movimientos/nuevo?producto=${p.id}`}>Registrar entrada</Link>
            </div>
          </article>
        ))}
        {lista.length === 0 && <div className="panel panel-b">Todo en orden: ningún producto activo está bajo el mínimo.</div>}
      </div>
    </>
  );
}
