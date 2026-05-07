import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/api';
import { validators, validateForm, sanitizeObject } from '../utils/validators';
import './CreateProduct.css';

const CATEGORIES = [
  'Libros y Apuntes',
  'Electrónica',
  'Ropa y Accesorios',
  'Tutorías y Servicios',
  'Laboratorio y Ciencias',
  'Arte y Diseño',
  'Deportes',
  'Alimentos',
  'Otros',
];

const CONDITIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado — buen estado' },
  { value: 'usado-regular', label: 'Usado — estado regular' },
];

const CreateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '1',
    condition: 'nuevo',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    productService.getById(id)
      .then(res => {
        const p = res.data.product;
        setForm({
          name: p.name || p.title || '',
          price: String(p.price || ''),
          description: p.description || '',
          category: p.category || '',
          stock: String(p.stock || '1'),
          condition: p.condition || p.estado || 'nuevo',
          image: p.image || '',
        });
      })
      .catch(() => navigate('/my-products'))
      .finally(() => setLoadingProduct(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rules = {
      name: [v => validators.required(v, 'Nombre'), v => validators.minLength(v, 3, 'Nombre'), v => validators.maxLength(v, 100, 'Nombre')],
      price: [v => validators.required(v, 'Precio'), v => validators.positiveNumber(v, 'Precio')],
      description: [v => validators.required(v, 'Descripción'), v => validators.minLength(v, 10, 'Descripción'), v => validators.maxLength(v, 1000, 'Descripción')],
      category: [v => validators.required(v, 'Categoría')],
      stock: [v => validators.nonNegativeInt(v, 'Stock')],
    };
    const { isValid, errors: formErrors } = validateForm(form, rules);
    if (!isValid) { setErrors(formErrors); return; }

    setLoading(true);
    const payload = sanitizeObject({
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      stock: Number(form.stock),
      condition: form.condition,
      estado: form.condition,
      image: form.image || undefined,
    });

    try {
      if (isEdit) {
        await productService.update(id, payload);
      } else {
        await productService.create(payload);
      }
      navigate('/my-products');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al guardar el producto';
      setErrors({ general: msg });
    }
    setLoading(false);
  };

  if (loadingProduct) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="cp-page">
      <div className="container cp-wrap">
        <div className="cp-header">
          <button className="cp-back" onClick={() => navigate('/my-products')}>← Volver</button>
          <h1 className="cp-title">{isEdit ? 'Editar producto' : 'Publicar producto'}</h1>
          <p className="cp-sub">{isEdit ? 'Modifica los datos de tu publicación' : 'Comparte lo que quieres vender con la comunidad'}</p>
        </div>

        <form className="cp-form" onSubmit={handleSubmit} noValidate>
          {errors.general && <div className="alert alert-error">{errors.general}</div>}

          <div className="cp-grid">
            {/* Left column */}
            <div className="cp-col">
              <div className="form-group">
                <label className="form-label">Nombre del producto *</label>
                <input className={`input ${errors.name ? 'error' : ''}`} placeholder="ej. Cálculo de una variable — Stewart 8va ed." value={form.name} onChange={set('name')} maxLength={100} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="cp-row">
                <div className="form-group">
                  <label className="form-label">Precio (COP) *</label>
                  <input type="number" className={`input ${errors.price ? 'error' : ''}`} placeholder="ej. 25000" value={form.price} onChange={set('price')} min="0" />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Stock disponible *</label>
                  <input type="number" className={`input ${errors.stock ? 'error' : ''}`} placeholder="ej. 1" value={form.stock} onChange={set('stock')} min="0" />
                  {errors.stock && <span className="form-error">{errors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <textarea className={`input cp-textarea ${errors.description ? 'error' : ''}`} placeholder="Describe el estado, características y cualquier detalle relevante..." value={form.description} onChange={set('description')} rows={5} maxLength={1000} />
                <div className="cp-char-count">{form.description.length}/1000</div>
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
            </div>

            {/* Right column */}
            <div className="cp-col">
              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select className={`input ${errors.category ? 'error' : ''}`} value={form.category} onChange={set('category')}>
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Estado del artículo</label>
                <div className="cp-condition-group">
                  {CONDITIONS.map(c => (
                    <label key={c.value} className={`cp-condition-option ${form.condition === c.value ? 'selected' : ''}`}>
                      <input type="radio" name="condition" value={c.value} checked={form.condition === c.value} onChange={set('condition')} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">URL de imagen (opcional)</label>
                <input className="input" placeholder="https://..." value={form.image} onChange={set('image')} type="url" />
                <p className="cp-hint">Pega un enlace directo a la imagen del producto</p>
              </div>

              {form.image && (
                <div className="cp-preview">
                  <p className="cp-preview-label">Vista previa</p>
                  <img src={form.image} alt="preview" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>

          <div className="cp-footer">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-products')}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? '💾 Guardar cambios' : '🚀 Publicar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
