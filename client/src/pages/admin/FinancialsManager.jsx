import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Plus, Download, Search, ChevronLeft, ChevronRight,
    Edit2, Trash2, X, IndianRupee, TrendingUp, TrendingDown,
    Wallet, Filter, RotateCcw, ArrowUpDown, Calendar, Receipt,
    ExternalLink, ImagePlus, ZoomIn, ChevronDown, Eye, Paperclip
} from 'lucide-react';
import api, { API_BASE_URL } from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPES = ['Donation', 'Revenue', 'Expenditure'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank', 'Cheque', 'Online', 'Other'];
const CATEGORIES = [
    'General', 'Annadanam', 'Development', 'Festival', 'Gau Seva',
    'Education', 'Maintenance', 'Salary', 'Utilities', 'Construction',
    'Charity', 'Puja Materials', 'Transport', 'Medical', 'Miscellaneous'
];
const PIE_COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d', '#f59e0b', '#eab308', '#ca8a04', '#a16207'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - i);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const typeBadgeClass = {
    Donation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    Revenue: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    Expenditure: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
};
const TypeBadge = ({ type }) => (
    <span className={`${typeBadgeClass[type] || ''} font-bold px-2 py-0.5 rounded-full text-[9px] uppercase`}>{type}</span>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className={`${color} p-4 rounded-2xl shadow border space-y-1.5`}>
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 opacity-70 shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 leading-tight">{label}</span>
        </div>
        <div className="text-xl md:text-2xl font-extrabold truncate">{value}</div>
        {sub && <p className="text-[10px] opacity-60 leading-tight">{sub}</p>}
    </div>
);

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) => {
    useEffect(() => {
        const esc = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', esc);
        return () => window.removeEventListener('keydown', esc);
    }, [onClose]);
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <img
                src={src}
                alt="Bill attachment"
                className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
            />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

// ─── Attachment Gallery (inside drawer) ───────────────────────────────────────
const AttachmentGallery = ({ record, onUploaded, onDeleted }) => {
    const fileRef = useRef(null);
    const [lightbox, setLightbox] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [caption, setCaption] = useState('');

    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('attachment', file);
            if (caption.trim()) fd.append('caption', caption.trim());
            const res = await api.post(`/financials/${record._id}/attachments`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUploaded(res.data.data);
            setCaption('');
            if (fileRef.current) fileRef.current.value = '';
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachmentId) => {
        setDeletingId(attachmentId);
        try {
            await api.delete(`/financials/${record._id}/attachments/${attachmentId}`);
            onDeleted(attachmentId);
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const attachments = record.attachments || [];

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-gray-700 dark:text-white">
                    Bill Images ({attachments.length})
                </span>
            </div>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-xl p-3 space-y-2 bg-amber-50/50 dark:bg-amber-950/10">
                <input
                    ref={fileRef}
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 dark:text-white"
                />
                <label className={`flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleUpload(e.target.files?.[0])}
                        disabled={uploading}
                    />
                    <span className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
                        <ImagePlus className="h-3.5 w-3.5" />
                        {uploading ? 'Uploading...' : 'Add Bill Image'}
                    </span>
                </label>
                <p className="text-[10px] text-center text-gray-400">JPG, PNG, WEBP • max 10 MB</p>
            </div>

            {/* Thumbnails grid */}
            {attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {attachments.map(att => (
                        <div key={att._id} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 aspect-square bg-gray-50 dark:bg-slate-800">
                            <img
                                src={att.url}
                                alt={att.caption || 'Bill'}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <button
                                    onClick={() => setLightbox(att.url)}
                                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
                                    title="View full"
                                ><ZoomIn className="h-3.5 w-3.5" /></button>
                                <button
                                    onClick={() => handleDelete(att._id)}
                                    disabled={deletingId === att._id}
                                    className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white transition disabled:opacity-50"
                                    title="Delete"
                                ><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            {att.caption && (
                                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-[9px] truncate">
                                    {att.caption}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-center text-gray-400 py-4">No bill images attached yet</p>
            )}

            {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
        </div>
    );
};

// ─── Record Detail Drawer ─────────────────────────────────────────────────────
const DetailDrawer = ({ record: initialRecord, onClose, onEdit, onDelete }) => {
    const [record, setRecord] = useState(initialRecord);

    useEffect(() => setRecord(initialRecord), [initialRecord]);

    if (!record) return null;

    const handleUploaded = (att) => {
        setRecord(r => ({ ...r, attachments: [...(r.attachments || []), att] }));
    };
    const handleDeleted = (id) => {
        setRecord(r => ({ ...r, attachments: (r.attachments || []).filter(a => a._id !== id) }));
    };

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl border-l border-gray-100 dark:border-slate-800 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <TypeBadge type={record.type} />
                        <span className="text-sm font-bold text-gray-700 dark:text-white truncate">{record.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => { onClose(); onEdit(record); }} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { onClose(); onDelete(record); }} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"><X className="h-4 w-4 text-gray-400" /></button>
                    </div>
                </div>

                <div className="flex-1 p-5 space-y-5">
                    {/* Amount */}
                    <div className={`p-4 rounded-2xl text-center ${record.type === 'Expenditure' ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}>
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Amount</p>
                        <p className={`text-3xl font-extrabold ${record.type === 'Expenditure' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {record.type === 'Expenditure' ? '−' : '+'}{fmtINR(record.amount)}
                        </p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Date', value: fmtDate(record.date) },
                            { label: 'Payment', value: record.paymentMethod || '—' },
                            { label: 'Person / Org', value: record.personOrOrg || '—' },
                            { label: 'Reference No.', value: record.referenceNo || '—' },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                <p className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">{label}</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-white truncate">{value}</p>
                            </div>
                        ))}
                    </div>

                    {(record.description || record.expenseDetails) && (
                        <div className="space-y-2">
                            {record.expenseDetails && (
                                <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-3">
                                    <p className="text-[9px] uppercase font-bold text-rose-500 mb-1">Where money was spent</p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{record.expenseDetails}</p>
                                </div>
                            )}
                            {record.description && (
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Notes</p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{record.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Legacy receiptUrl */}
                    {record.receiptUrl && (
                        <a href={record.receiptUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline">
                            <Receipt className="h-3.5 w-3.5" /> View Legacy Receipt <ExternalLink className="h-3 w-3" />
                        </a>
                    )}

                    {/* Attachments CRUD */}
                    <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                        <AttachmentGallery
                            record={record}
                            onUploaded={handleUploaded}
                            onDeleted={handleDeleted}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Record Form Modal ────────────────────────────────────────────────────────
const RecordModal = ({ isOpen, onClose, onSave, initial }) => {
    const emptyForm = {
        type: 'Donation', amount: '', date: new Date().toISOString().split('T')[0],
        category: 'General', paymentMethod: 'Cash', personOrOrg: '',
        referenceNo: '', description: '', expenseDetails: '', receiptUrl: ''
    };
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(initial ? {
            type: initial.type || 'Donation',
            amount: initial.amount || '',
            date: initial.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: initial.category || 'General',
            paymentMethod: initial.paymentMethod || 'Cash',
            personOrOrg: initial.personOrOrg || '',
            referenceNo: initial.referenceNo || '',
            description: initial.description || '',
            expenseDetails: initial.expenseDetails || '',
            receiptUrl: initial.receiptUrl || ''
        } : emptyForm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, isOpen]);

    if (!isOpen) return null;

    const ic = 'w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white';
    const lc = 'block text-[10px] font-bold text-gray-400 dark:text-slate-400 mb-1 uppercase tracking-wider';
    const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.date || !form.category) return;
        setSaving(true);
        try {
            await onSave({ ...form, amount: parseFloat(form.amount) });
            onClose();
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">
                        {initial ? 'Edit Record' : 'Add Financial Record'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Type *</label>
                            <select value={form.type} onChange={e => f('type', e.target.value)} className={ic}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lc}>Amount (₹) *</label>
                            <input type="number" min="0" step="0.01" required value={form.amount} onChange={e => f('amount', e.target.value)} className={ic} placeholder="0.00" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Date *</label>
                            <input type="date" required value={form.date} onChange={e => f('date', e.target.value)} className={ic} />
                        </div>
                        <div>
                            <label className={lc}>Category *</label>
                            <select value={form.category} onChange={e => f('category', e.target.value)} className={ic}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Payment Method</label>
                            <select value={form.paymentMethod} onChange={e => f('paymentMethod', e.target.value)} className={ic}>
                                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lc}>Reference No.</label>
                            <input type="text" value={form.referenceNo} onChange={e => f('referenceNo', e.target.value)} className={ic} placeholder="e.g. TXN123" />
                        </div>
                    </div>
                    <div>
                        <label className={lc}>Person / Organization</label>
                        <input type="text" value={form.personOrOrg} onChange={e => f('personOrOrg', e.target.value)} className={ic} placeholder="Name" />
                    </div>
                    {form.type === 'Expenditure' && (
                        <div className="space-y-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-rose-600" />
                                <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">Expenditure Details</span>
                            </div>
                            <div>
                                <label className={lc}>Where was the money spent?</label>
                                <textarea rows="3" value={form.expenseDetails} onChange={e => f('expenseDetails', e.target.value)} className={ic + ' resize-none'} placeholder="Describe what the expense was for..." />
                                <p className="text-[10px] text-gray-400 mt-1">Bill images can be attached after saving the record.</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className={lc}>Notes</label>
                        <textarea rows="2" value={form.description} onChange={e => f('description', e.target.value)} className={ic + ' resize-none'} placeholder="Optional notes..." />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50">
                            {saving ? 'Saving...' : initial ? 'Update Record' : 'Add Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Delete Record?</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">This action cannot be undone.</p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50">
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FinancialsManager = () => {
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [filters, setFilters] = useState({ type: '', category: '', paymentMethod: '', month: '', year: '', startDate: '', endDate: '', search: '' });
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showModal, setShowModal] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const buildQS = useCallback((page = 1) => {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
        p.set('sortBy', sortBy);
        p.set('sortOrder', sortOrder);
        p.set('page', page);
        p.set('limit', pagination.limit);
        return p.toString();
    }, [filters, sortBy, sortOrder, pagination.limit]);

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const qs = buildQS(page);
            const [rRes, sRes] = await Promise.all([
                api.get(`/financials?${qs}`),
                api.get(`/financials/summary?${qs}`)
            ]);
            setRecords(rRes.data.data || []);
            setPagination(rRes.data.pagination || { page: 1, limit: 15, total: 0, pages: 0 });
            setSummary(sRes.data.data || null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [buildQS]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (data) => {
        if (editRecord) await api.put(`/financials/${editRecord._id}`, data);
        else await api.post('/financials', data);
        setEditRecord(null);
        fetchData(pagination.page);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/financials/${deleteTarget._id}`);
            setDeleteTarget(null);
            fetchData(pagination.page);
        } catch (err) { console.error(err); }
        finally { setDeleting(false); }
    };

    const handleSort = (col) => {
        if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortOrder('desc'); }
    };

    const clearFilters = () => setFilters({ type: '', category: '', paymentMethod: '', month: '', year: '', startDate: '', endDate: '', search: '' });
    const hasActiveFilters = Object.values(filters).some(Boolean);

    const handleExport = () => {
        const token = localStorage.getItem('token');
        window.open(`${API_BASE_URL}/financials/export?${buildQS(1)}&token=${token}`, '_blank');
    };

    const openDrawer = (record) => { setDrawerRecord(null); setTimeout(() => setDrawerRecord(record), 0); };

    const sc = 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 dark:text-white';

    return (
        <AdminPageLayout>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Financial Management</h1>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Track donations, revenue, expenditure and bill receipts</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    <button onClick={() => { setEditRecord(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex-1 sm:flex-none justify-center">
                        <Plus className="h-3.5 w-3.5" /> Add Record
                    </button>
                    <button onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex-1 sm:flex-none justify-center">
                        <Download className="h-3.5 w-3.5" /> Export
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            {loading && !summary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            ) : summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={IndianRupee} label="Total Donations" color="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                        value={fmtINR(summary.totalDonations)} sub="All-time donations received" />
                    <StatCard icon={TrendingUp} label="Total Revenue" color="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300"
                        value={fmtINR(summary.totalRevenue)} sub="Services, events & other income" />
                    <StatCard icon={TrendingDown} label="Total Expenditure" color="bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300"
                        value={fmtINR(summary.totalExpenditure)} sub="All expenses paid" />
                    <StatCard icon={Wallet} label="Net Balance" color="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300"
                        value={fmtINR(summary.netBalance)} sub="Donations + Revenue − Expenditure" />
                </div>
            )}

            {/* ── Charts ── */}
            {summary && (summary.monthlyData?.length > 0 || summary.categoryData?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {summary.monthlyData?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-5 rounded-2xl shadow">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Monthly Income vs Expenditure (₹)</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={summary.monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                    <YAxis tick={{ fontSize: 9 }} />
                                    <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                                    <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenditure" name="Expenditure" fill="#e11d48" radius={[4, 4, 0, 0]} />
                                    <Legend />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {summary.categoryData?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-5 rounded-2xl shadow">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Category-wise Expenditure</h3>
                            <div className="flex items-center gap-4">
                                <ResponsiveContainer width={150} height={150}>
                                    <PieChart>
                                        <Pie data={summary.categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                            {summary.categoryData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1.5 text-xs flex-1 min-w-0">
                                    {summary.categoryData.slice(0, 8).map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-gray-600 dark:text-slate-300 truncate">{item.name}: <strong>{fmtINR(item.value)}</strong></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Filters ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-4 shadow space-y-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-slate-300"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filters
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-bold">
                            <RotateCcw className="h-3 w-3" /> Clear
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className={sc}>
                            <option value="">All Types</option>
                            {TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className={sc}>
                            <option value="">All Categories</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <select value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))} className={sc}>
                            <option value="">All Methods</option>
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                        <select value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} className={sc}>
                            <option value="">All Months</option>
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))} className={sc}>
                            <option value="">All Years</option>
                            {YEARS.map(y => <option key={y}>{y}</option>)}
                        </select>
                        <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className={sc} placeholder="From" />
                        <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className={sc} placeholder="To" />
                    </div>
                )}

                {/* Search always visible */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search person, expense, category..."
                        value={filters.search}
                        onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
                    />
                </div>
            </div>

            {/* ── Transaction Count ── */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="font-bold">{pagination.total} transaction{pagination.total !== 1 ? 's' : ''} found</span>
                <span className="text-gray-300 dark:text-slate-600">•</span>
                <span>Click any row to view details & attach bill images</span>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
                {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
                    : records.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-10">No records found.</p>
                    ) : records.map(record => (
                        <div key={record._id}
                            onClick={() => openDrawer(record)}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow active:scale-[0.99] transition-transform cursor-pointer">
                            <div className="flex justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <TypeBadge type={record.type} />
                                        <span className="text-[9px] text-gray-400">{fmtDate(record.date)}</span>
                                        {record.attachments?.length > 0 && (
                                            <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Paperclip className="h-2.5 w-2.5" />{record.attachments.length}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-bold text-sm text-gray-800 dark:text-white truncate mt-1">{record.personOrOrg || record.category}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{record.category} • {record.paymentMethod}</p>
                                    {record.type === 'Expenditure' && record.expenseDetails && (
                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{record.expenseDetails}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                    <p className={`font-extrabold text-base ${record.type === 'Expenditure' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {record.type === 'Expenditure' ? '−' : '+'}₹{record.amount.toLocaleString('en-IN')}
                                    </p>
                                    <div className="flex gap-1">
                                        <button onClick={e => { e.stopPropagation(); setEditRecord(record); setShowModal(true); }}
                                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Edit2 className="h-3 w-3" /></button>
                                        <button onClick={e => { e.stopPropagation(); setDeleteTarget(record); }}
                                            className="p-1.5 rounded-lg bg-red-50 text-red-600"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-amber-50 dark:bg-slate-800">
                            <tr>
                                {[
                                    { key: 'date', label: 'Date' },
                                    { key: 'type', label: 'Type' },
                                    { key: 'category', label: 'Category / Details' },
                                    { key: 'personOrOrg', label: 'Person / Org' },
                                    { key: 'paymentMethod', label: 'Payment' },
                                    { key: 'amount', label: 'Amount (₹)' },
                                    { key: 'referenceNo', label: 'Ref No.' },
                                    { key: null, label: 'Bills' },
                                    { key: null, label: 'Actions' },
                                ].map(({ key, label }) => (
                                    <th key={label} className="px-4 py-3 text-left font-bold whitespace-nowrap">
                                        {key ? (
                                            <button onClick={() => handleSort(key)} className="flex items-center gap-1">
                                                {label}
                                                {sortBy === key && <ArrowUpDown className="h-3 w-3 text-amber-500" />}
                                            </button>
                                        ) : label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={9} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-slate-400">No records found.</td></tr>
                            ) : records.map(record => (
                                <tr key={record._id}
                                    onClick={() => openDrawer(record)}
                                    className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-gray-300" />
                                            {fmtDate(record.date)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><TypeBadge type={record.type} /></td>
                                    <td className="px-4 py-3 max-w-[200px]">
                                        <span className="bg-gray-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded-full text-[9px]">{record.category}</span>
                                        {record.type === 'Expenditure' && record.expenseDetails && (
                                            <p className="text-[9px] text-gray-400 truncate mt-0.5" title={record.expenseDetails}>{record.expenseDetails}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-bold max-w-[130px] truncate">{record.personOrOrg || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500">{record.paymentMethod}</td>
                                    <td className={`px-4 py-3 font-extrabold ${record.type === 'Expenditure' ? 'text-rose-600' : 'text-emerald-700'}`}>
                                        {record.type === 'Expenditure' ? '−' : '+'}₹{record.amount.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">{record.referenceNo || '—'}</td>
                                    <td className="px-4 py-3">
                                        {record.attachments?.length > 0 ? (
                                            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-bold px-2 py-1 rounded-full">
                                                <Paperclip className="h-2.5 w-2.5" />{record.attachments.length}
                                            </span>
                                        ) : record.receiptUrl ? (
                                            <a href={record.receiptUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                                                <Receipt className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={e => { e.stopPropagation(); setEditRecord(record); setShowModal(true); }}
                                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100">
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setDeleteTarget(record); }}
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); openDrawer(record); }}
                                                title="View details"
                                                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                                                <Eye className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Pagination ── */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.pages}</span>
                    <div className="flex gap-1">
                        <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            <RecordModal isOpen={showModal} onClose={() => { setShowModal(false); setEditRecord(null); }} onSave={handleSave} initial={editRecord} />
            <DeleteModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />

            {/* ── Detail Drawer ── */}
            {drawerRecord && (
                <DetailDrawer
                    record={drawerRecord}
                    onClose={() => setDrawerRecord(null)}
                    onEdit={(r) => { setEditRecord(r); setShowModal(true); }}
                    onDelete={(r) => setDeleteTarget(r)}
                />
            )}
        </AdminPageLayout>
    );
};

export default FinancialsManager;