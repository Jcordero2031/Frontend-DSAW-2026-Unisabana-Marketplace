import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import './Admin.css';

const TABS = ['Productos', 'Usuarios', 'Reportes'];

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

const formatPrice = (p) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p);

/* ─── Products tab ───────────────────────────────────── */
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    adminService.getProducts()
      .then(res => setProducts(res.data.products || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    setDeletingId(productId);
    try {
      await adminService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
    setDeletingId(null);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: 200 }}><div className="spinner" /></div>;

  return (
    <div className="admin-table-wrap">
      <p className="admin-count">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Vendedor</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className={p.active === false ? 'row-inactive' : ''}>
              <td>
                <div className="admin-product-name">{p.name || p.title}</div>
                <div className="admin-product-cat">{p.category}</div>
              </td>
              <td>{formatPrice(p.price)}</td>
              <td>{p.stock}</td>
              <td>{p.seller?.name || p.sellerName || '-'}</td>
              <td>
                <span className={`badge ${p.active === false ? 'badge-usado' : 'badge-nuevo'}`}>
                  {p.active === false ? 'Inactivo' : 'Activo'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                >
                  {deletingId === p.id ? '...' : '🗑️ Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Users tab ──────────────────────────────────────── */
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    adminService.getUsers()
      .then(res => setUsers(res.data.users || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspendido' ? 'activo' : 'suspendido';
    if (!window.confirm(`¿${newStatus === 'suspendido' ? 'Suspender' : 'Rehabilitar'} este usuario?`)) return;
    setUpdatingId(userId);
    try {
      await adminService.updateUserStatus(userId, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar usuario');
    }
    setUpdatingId(null);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: 200 }}><div className="spinner" /></div>;

  return (
    <div className="admin-table-wrap">
      <p className="admin-count">{users.length} usuario{users.length !== 1 ? 's' : ''}</p>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Registro</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="admin-user-name">{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`badge ${u.role === 'admin' ? 'badge-popular' : u.role === 'seller' ? 'badge-nuevo' : 'badge-usado'}`}>{u.role}</span></td>
              <td>{formatDate(u.createdAt)}</td>
              <td>
                <span className={`badge ${u.status === 'suspendido' ? 'badge-usado' : 'badge-nuevo'}`}>
                  {u.status || 'activo'}
                </span>
              </td>
              <td>
                <button
                  className={`btn btn-sm ${u.status === 'suspendido' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleStatus(u.id, u.status || 'activo')}
                  disabled={updatingId === u.id || u.role === 'admin'}
                  title={u.role === 'admin' ? 'No se puede suspender un admin' : ''}
                >
                  {updatingId === u.id ? '...' : u.status === 'suspendido' ? '✓ Rehabilitar' : '⛔ Suspender'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Reports tab ────────────────────────────────────── */
const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendiente');
  const [resolvingId, setResolvingId] = useState(null);

  const loadReports = useCallback(() => {
    setLoading(true);
    adminService.getReports({ status: filter })
      .then(res => setReports(res.data.reports || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const resolve = async (reportId) => {
    setResolvingId(reportId);
    try {
      await adminService.resolveReport(reportId);
      setReports(prev => prev.filter(r => r.reportId !== reportId && r.id !== reportId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al resolver');
    }
    setResolvingId(null);
  };

  return (
    <div className="admin-table-wrap">
      <div className="admin-filter-row">
        <button className={`btn btn-sm ${filter === 'pendiente' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('pendiente')}>Pendientes</button>
        <button className={`btn btn-sm ${filter === 'resuelto' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('resuelto')}>Resueltos</button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
      ) : reports.length === 0 ? (
        <p className="admin-empty">No hay reportes {filter === 'pendiente' ? 'pendientes' : 'resueltos'}.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Reportado por</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.reportId || r.id}>
                <td>
                  <span className="badge badge-popular">
                    {r.targetType === 'product' ? '📦 Producto' : '👤 Usuario'}
                  </span>
                </td>
                <td className="admin-report-reason">{r.reason}</td>
                <td>{r.reporterName || r.reporter?.name || '-'}</td>
                <td>{formatDate(r.createdAt)}</td>
                <td>
                  <span className={`badge ${r.status === 'resuelto' ? 'badge-nuevo' : 'badge-usado'}`}>{r.status}</span>
                </td>
                <td>
                  {r.status !== 'resuelto' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => resolve(r.reportId || r.id)}
                      disabled={resolvingId === (r.reportId || r.id)}
                    >
                      {resolvingId === (r.reportId || r.id) ? '...' : '✓ Resolver'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/* ─── Main Admin page ────────────────────────────────── */
const Admin = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Panel de Administración</h1>
          <span className="admin-badge">Admin</span>
        </div>

        <div className="admin-tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {activeTab === 0 && <ProductsTab />}
          {activeTab === 1 && <UsersTab />}
          {activeTab === 2 && <ReportsTab />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
