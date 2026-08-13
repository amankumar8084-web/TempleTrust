import React, {
    useState,
    useEffect,
    useCallback
} from 'react';

import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

import {
    Plus,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    X,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Wallet,
    Filter,
    RotateCcw,
    ArrowUpDown,
    Calendar,
    Receipt,
    ExternalLink
} from 'lucide-react';

import api, {
    API_BASE_URL
} from '../../services/api.js';

import Skeleton from '../../components/common/Skeleton.jsx';


const TYPES = [
    'Donation',
    'Revenue',
    'Expenditure'
];

const PAYMENT_METHODS = [
    'Cash',
    'UPI',
    'Bank',
    'Cheque',
    'Online',
    'Other'
];

const CATEGORIES = [
    'General',
    'Annadanam',
    'Development',
    'Festival',
    'Gau Seva',
    'Education',
    'Maintenance',
    'Salary',
    'Utilities',
    'Construction',
    'Charity',
    'Puja Materials',
    'Transport',
    'Medical',
    'Miscellaneous'
];

const PIE_COLORS = [
    '#d97706',
    '#b45309',
    '#92400e',
    '#78350f',
    '#fbbf24',
    '#fcd34d',
    '#f59e0b',
    '#eab308',
    '#ca8a04',
    '#a16207'
];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

const currentYear =
    new Date().getFullYear();

const YEARS = Array.from(
    {
        length: 10
    },
    (_, i) => currentYear - i
);


// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    subtext
}) => (
    <div
        className={`${color} p-4 rounded-2xl shadow border space-y-1`}
    >
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 opacity-70" />

            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                {label}
            </span>
        </div>

        <div className="text-2xl font-extrabold">
            {value}
        </div>

        {subtext && (
            <p className="text-[10px] opacity-60">
                {subtext}
            </p>
        )}
    </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// Record Modal
// ─────────────────────────────────────────────────────────────────────────────
const RecordModal = ({
    isOpen,
    onClose,
    onSave,
    initial
}) => {

    const [form, setForm] = useState({
        type: 'Donation',
        amount: '',
        date: new Date()
            .toISOString()
            .split('T')[0],

        category: 'General',
        paymentMethod: 'Cash',
        personOrOrg: '',
        referenceNo: '',
        description: '',

        expenseDetails: '',
        receiptUrl: ''
    });

    const [receiptFile, setReceiptFile] =
        useState(null);

    const [saving, setSaving] =
        useState(false);


    useEffect(() => {

        if (initial) {

            setForm({
                type:
                    initial.type ||
                    'Donation',

                amount:
                    initial.amount ||
                    '',

                date:
                    initial.date
                        ? new Date(initial.date)
                            .toISOString()
                            .split('T')[0]
                        : new Date()
                            .toISOString()
                            .split('T')[0],

                category:
                    initial.category ||
                    'General',

                paymentMethod:
                    initial.paymentMethod ||
                    'Cash',

                personOrOrg:
                    initial.personOrOrg ||
                    '',

                referenceNo:
                    initial.referenceNo ||
                    '',

                description:
                    initial.description ||
                    '',

                expenseDetails:
                    initial.expenseDetails ||
                    '',

                receiptUrl:
                    initial.receiptUrl ||
                    ''
            });

        } else {

            setForm({
                type: 'Donation',
                amount: '',
                date: new Date()
                    .toISOString()
                    .split('T')[0],

                category: 'General',
                paymentMethod: 'Cash',
                personOrOrg: '',
                referenceNo: '',
                description: '',
                expenseDetails: '',
                receiptUrl: ''
            });
        }

        setReceiptFile(null);

    }, [initial, isOpen]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !form.amount ||
            !form.date ||
            !form.category
        ) {
            return;
        }

        setSaving(true);

        try {

            const formData = {
                ...form,
                amount:
                    parseFloat(form.amount),

                // This is available for backend
                // upload handling.
                receiptFile
            };

            await onSave(formData);

            onClose();

        } catch (error) {

            console.error(error);

        } finally {

            setSaving(false);
        }
    };


    if (!isOpen) {
        return null;
    }


    const inputClass =
        'w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white';

    const labelClass =
        'block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider';


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">

                    <h3 className="text-base font-extrabold text-gray-800 dark:text-white">

                        {initial
                            ? 'Edit Record'
                            : 'Add Financial Record'}

                    </h3>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-4"
                >

                    {/* Type + Amount */}
                    <div className="grid grid-cols-2 gap-3">

                        <div>

                            <label className={labelClass}>
                                Type *
                            </label>

                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        type: e.target.value
                                    }))
                                }
                                className={inputClass}
                            >

                                {TYPES.map(type => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}

                            </select>

                        </div>


                        <div>

                            <label className={labelClass}>
                                Amount (₹) *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={form.amount}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        amount:
                                            e.target.value
                                    }))
                                }
                                className={inputClass}
                                placeholder="0.00"
                            />

                        </div>

                    </div>


                    {/* Date + Category */}
                    <div className="grid grid-cols-2 gap-3">

                        <div>

                            <label className={labelClass}>
                                Date *
                            </label>

                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        date:
                                            e.target.value
                                    }))
                                }
                                className={inputClass}
                            />

                        </div>


                        <div>

                            <label className={labelClass}>
                                Category *
                            </label>

                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        category:
                                            e.target.value
                                    }))
                                }
                                className={inputClass}
                            >

                                {CATEGORIES.map(category => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}

                            </select>

                        </div>

                    </div>


                    {/* Payment + Reference */}
                    <div className="grid grid-cols-2 gap-3">

                        <div>

                            <label className={labelClass}>
                                Payment Method
                            </label>

                            <select
                                value={form.paymentMethod}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        paymentMethod:
                                            e.target.value
                                    }))
                                }
                                className={inputClass}
                            >

                                {PAYMENT_METHODS.map(method => (
                                    <option
                                        key={method}
                                        value={method}
                                    >
                                        {method}
                                    </option>
                                ))}

                            </select>

                        </div>


                        <div>

                            <label className={labelClass}>
                                Reference No.
                            </label>

                            <input
                                type="text"
                                value={form.referenceNo}
                                onChange={(e) =>
                                    setForm(f => ({
                                        ...f,
                                        referenceNo:
                                            e.target.value
                                    }))
                                }
                                className={inputClass}
                                placeholder="e.g. TXN123"
                            />

                        </div>

                    </div>


                    {/* Person / Organization */}
                    <div>

                        <label className={labelClass}>
                            Person / Organization
                        </label>

                        <input
                            type="text"
                            value={form.personOrOrg}
                            onChange={(e) =>
                                setForm(f => ({
                                    ...f,
                                    personOrOrg:
                                        e.target.value
                                }))
                            }
                            className={inputClass}
                            placeholder="Name"
                        />

                    </div>


                    {/* ─────────────────────────────────────────
                        EXPENDITURE DETAILS
                    ───────────────────────────────────────── */}
                    {form.type === 'Expenditure' && (

                        <div className="space-y-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">

                            <div className="flex items-center gap-2">

                                <TrendingDown className="h-4 w-4 text-rose-600" />

                                <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                                    Expenditure Details
                                </span>

                            </div>


                            <div>

                                <label className={labelClass}>
                                    Where was the money spent?
                                </label>

                                <textarea
                                    rows="3"
                                    value={
                                        form.expenseDetails
                                    }
                                    onChange={(e) =>
                                        setForm(f => ({
                                            ...f,
                                            expenseDetails:
                                                e.target.value
                                        }))
                                    }
                                    className={
                                        inputClass +
                                        ' resize-none'
                                    }
                                    placeholder="Example: Purchased 50 bags of rice for Annadanam program, paid to ABC Traders..."
                                />

                                <p className="text-[10px] text-gray-400 mt-1">
                                    Give a clear explanation of what the expense was for.
                                </p>

                            </div>


                            {/* Receipt Upload */}
                            <div>

                                <label className={labelClass}>
                                    Expense Receipt
                                </label>

                                <div className="border-2 border-dashed border-rose-200 dark:border-rose-900 rounded-xl p-3">

                                    <div className="flex items-center gap-3">

                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                            <Receipt className="h-5 w-5 text-rose-500" />
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) =>
                                                    setReceiptFile(
                                                        e.target.files?.[0] || null
                                                    )
                                                }
                                                className="w-full text-xs text-gray-500"
                                            />

                                            <p className="text-[10px] text-gray-400 mt-1">
                                                JPG, PNG or PDF
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* Existing receipt */}
                                {form.receiptUrl && (
                                    <a
                                        href={form.receiptUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        View existing receipt
                                    </a>
                                )}

                                {receiptFile && (
                                    <p className="text-[10px] text-emerald-600 font-bold mt-2">
                                        Selected: {receiptFile.name}
                                    </p>
                                )}

                            </div>

                        </div>
                    )}


                    {/* Description */}
                    <div>

                        <label className={labelClass}>
                            Description / Notes
                        </label>

                        <textarea
                            rows="2"
                            value={form.description}
                            onChange={(e) =>
                                setForm(f => ({
                                    ...f,
                                    description:
                                        e.target.value
                                }))
                            }
                            className={
                                inputClass +
                                ' resize-none'
                            }
                            placeholder="Optional notes..."
                        />

                    </div>


                    {/* Buttons */}
                    <div className="flex gap-2 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs py-2.5 rounded-xl transition disabled:opacity-50"
                        >
                            {saving
                                ? 'Saving...'
                                : initial
                                    ? 'Update Record'
                                    : 'Add Record'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading
}) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-slate-800 text-center space-y-4">

                <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center">

                    <Trash2 className="h-5 w-5 text-red-600" />

                </div>

                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                    Delete Record?
                </h3>

                <p className="text-xs text-gray-500 dark:text-slate-400">
                    This action cannot be undone. The record will be permanently removed.
                </p>

                <div className="flex gap-2">

                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50"
                    >
                        {loading
                            ? 'Deleting...'
                            : 'Delete'}
                    </button>

                </div>

            </div>

        </div>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
const FinancialsManager = () => {

    const [records, setRecords] =
        useState([]);

    const [summary, setSummary] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 15,
            total: 0,
            pages: 0
        });


    const [filters, setFilters] =
        useState({
            type: '',
            category: '',
            paymentMethod: '',
            month: '',
            year: '',
            startDate: '',
            endDate: '',
            search: ''
        });


    const [sortBy, setSortBy] =
        useState('date');

    const [sortOrder, setSortOrder] =
        useState('desc');


    const [showModal, setShowModal] =
        useState(false);

    const [editRecord, setEditRecord] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);


    // ─────────────────────────────────────────────
    // Query
    // ─────────────────────────────────────────────
    const buildQueryString =
        useCallback(
            (page = 1) => {

                const params =
                    new URLSearchParams();

                Object.entries(filters)
                    .forEach(([key, value]) => {

                        if (value) {
                            params.set(
                                key,
                                value
                            );
                        }

                    });

                params.set(
                    'sortBy',
                    sortBy
                );

                params.set(
                    'sortOrder',
                    sortOrder
                );

                params.set(
                    'page',
                    page
                );

                params.set(
                    'limit',
                    pagination.limit
                );

                return params.toString();
            },
            [
                filters,
                sortBy,
                sortOrder,
                pagination.limit
            ]
        );


    // ─────────────────────────────────────────────
    // Fetch
    // ─────────────────────────────────────────────
    const fetchData =
        useCallback(
            async (page = 1) => {

                setLoading(true);

                try {

                    const qs =
                        buildQueryString(
                            page
                        );

                    const [
                        recordsResponse,
                        summaryResponse
                    ] =
                        await Promise.all([
                            api.get(
                                `/financials?${qs}`
                            ),

                            api.get(
                                `/financials/summary?${qs}`
                            )
                        ]);

                    setRecords(
                        recordsResponse
                            .data
                            .data || []
                    );

                    setPagination(
                        recordsResponse
                            .data
                            .pagination || {
                                page: 1,
                                limit: 15,
                                total: 0,
                                pages: 0
                            }
                    );

                    setSummary(
                        summaryResponse
                            .data
                            .data || null
                    );

                } catch (error) {

                    console.error(error);

                } finally {

                    setLoading(false);
                }

            },
            [buildQueryString]
        );


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // ─────────────────────────────────────────────
    // Save
    // ─────────────────────────────────────────────
    const handleSave =
        async (formData) => {

            const {
                receiptFile,
                ...data
            } = formData;


            // Existing API is preserved.
            //
            // If your backend already has a
            // Cloudinary upload route, upload the
            // receipt there first and put the
            // returned URL into data.receiptUrl.
            //
            // For now we preserve the receiptFile
            // for your upload middleware.


            if (editRecord) {

                await api.put(
                    `/financials/${editRecord._id}`,
                    data
                );

            } else {

                await api.post(
                    '/financials',
                    data
                );
            }


            setEditRecord(null);

            fetchData(
                pagination.page
            );
        };


    // ─────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────
    const handleDelete =
        async () => {

            if (!deleteTarget) {
                return;
            }

            setDeleting(true);

            try {

                await api.delete(
                    `/financials/${deleteTarget._id}`
                );

                setDeleteTarget(null);

                fetchData(
                    pagination.page
                );

            } catch (error) {

                console.error(error);

            } finally {

                setDeleting(false);
            }
        };


    // ─────────────────────────────────────────────
    // Sort
    // ─────────────────────────────────────────────
    const handleSort =
        (column) => {

            if (sortBy === column) {

                setSortOrder(
                    order =>
                        order === 'asc'
                            ? 'desc'
                            : 'asc'
                );

            } else {

                setSortBy(column);
                setSortOrder('desc');

            }
        };


    // ─────────────────────────────────────────────
    // Clear filters
    // ─────────────────────────────────────────────
    const clearFilters =
        () => {

            setFilters({
                type: '',
                category: '',
                paymentMethod: '',
                month: '',
                year: '',
                startDate: '',
                endDate: '',
                search: ''
            });
        };


    // ─────────────────────────────────────────────
    // Excel export
    // ─────────────────────────────────────────────
    const handleExport =
        () => {

            const qs =
                buildQueryString(1);

            const token =
                localStorage.getItem(
                    'token'
                );

            window.open(
                `${API_BASE_URL}/financials/export?${qs}&token=${token}`,
                '_blank'
            );
        };


    const typeBadge =
        (type) => {

            const styles = {

                Donation:
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',

                Revenue:
                    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',

                Expenditure:
                    'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            };

            return (
                <span
                    className={`${styles[type] || ''} font-bold px-2 py-0.5 rounded-full text-[9px]`}
                >
                    {type}
                </span>
            );
        };


    const selectClass =
        'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 dark:text-white';


    const hasActiveFilters =
        Object.values(filters)
            .some(value => value);


    return (

        <AdminPageLayout>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                <div>

                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">
                        Financial Management
                    </h1>

                    <p className="text-xs text-gray-500 dark:text-slate-400">
                        Track donations, revenue, expenditure and receipts
                    </p>

                </div>


                <div className="flex gap-2 w-full sm:w-auto">

                    <button
                        onClick={() => {
                            setEditRecord(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex-1 sm:flex-none justify-center"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Record
                    </button>


                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex-1 sm:flex-none justify-center"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export Excel
                    </button>

                </div>

            </div>


            {/* Overview */}
            {loading && !summary ? (

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                    {[1, 2, 3, 4].map(
                        item => (
                            <Skeleton
                                key={item}
                                className="h-24 rounded-2xl"
                            />
                        )
                    )}

                </div>

            ) : summary && (

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                    <StatCard
                        icon={IndianRupee}
                        label="Total Donations"
                        color="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                        value={`₹${(summary.totalDonations || 0).toLocaleString()}`}
                    />

                    <StatCard
                        icon={TrendingUp}
                        label="Total Revenue"
                        color="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300"
                        value={`₹${(summary.totalRevenue || 0).toLocaleString()}`}
                    />

                    <StatCard
                        icon={TrendingDown}
                        label="Total Expenditure"
                        color="bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300"
                        value={`₹${(summary.totalExpenditure || 0).toLocaleString()}`}
                    />

                    <StatCard
                        icon={Wallet}
                        label="Net Balance"
                        color="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300"
                        value={`₹${(summary.netBalance || 0).toLocaleString()}`}
                        subtext="Donations + Revenue − Expenditure"
                    />

                </div>
            )}


            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-4 shadow space-y-3">

                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-300">

                    <Filter className="h-3.5 w-3.5" />

                    Filters

                    {hasActiveFilters && (

                        <button
                            onClick={clearFilters}
                            className="ml-auto flex items-center gap-1 text-amber-600 hover:text-amber-700"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Clear
                        </button>

                    )}

                </div>


                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">

                    <select
                        value={filters.type}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                type: e.target.value
                            }))
                        }
                        className={selectClass}
                    >
                        <option value="">
                            All Types
                        </option>

                        {TYPES.map(type => (
                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>
                        ))}

                    </select>


                    <select
                        value={filters.category}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                category:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    >

                        <option value="">
                            All Categories
                        </option>

                        {CATEGORIES.map(category => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}

                    </select>


                    <select
                        value={filters.paymentMethod}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                paymentMethod:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    >

                        <option value="">
                            All Methods
                        </option>

                        {PAYMENT_METHODS.map(method => (
                            <option
                                key={method}
                                value={method}
                            >
                                {method}
                            </option>
                        ))}

                    </select>


                    <select
                        value={filters.month}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                month:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    >

                        <option value="">
                            All Months
                        </option>

                        {MONTHS.map((month, index) => (
                            <option
                                key={month}
                                value={index + 1}
                            >
                                {month}
                            </option>
                        ))}

                    </select>


                    <select
                        value={filters.year}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                year:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    >

                        <option value="">
                            All Years
                        </option>

                        {YEARS.map(year => (
                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>
                        ))}

                    </select>


                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                startDate:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    />


                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                endDate:
                                    e.target.value
                            }))
                        }
                        className={selectClass}
                    />

                </div>


                <div className="relative max-w-sm">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search person, expense, category..."
                        value={filters.search}
                        onChange={e =>
                            setFilters(f => ({
                                ...f,
                                search:
                                    e.target.value
                            }))
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
                    />

                </div>

            </div>


            {/* Charts */}
            {summary &&
                (
                    summary.monthlyData?.length >
                    0 ||
                    summary.categoryData?.length >
                    0
                ) && (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {summary.monthlyData?.length > 0 && (

                            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

                                <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">
                                    Monthly Income vs Expenditure (₹)
                                </h3>

                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                >

                                    <BarChart
                                        data={
                                            summary.monthlyData
                                        }
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <YAxis
                                            tick={{
                                                fontSize: 9
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                `₹${Number(value).toLocaleString()}`
                                            }
                                        />

                                        <Bar
                                            dataKey="income"
                                            name="Income"
                                            fill="#059669"
                                            radius={[
                                                4,
                                                4,
                                                0,
                                                0
                                            ]}
                                        />

                                        <Bar
                                            dataKey="expenditure"
                                            name="Expenditure"
                                            fill="#e11d48"
                                            radius={[
                                                4,
                                                4,
                                                0,
                                                0
                                            ]}
                                        />

                                        <Legend />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>
                        )}


                        {summary.categoryData?.length > 0 && (

                            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 md:p-6 rounded-2xl shadow">

                                <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">
                                    Category-wise Expenditure
                                </h3>

                                <div className="flex items-center gap-4">

                                    <ResponsiveContainer
                                        width={160}
                                        height={160}
                                    >

                                        <PieChart>

                                            <Pie
                                                data={
                                                    summary.categoryData
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={70}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >

                                                {summary.categoryData.map(
                                                    (_, index) => (
                                                        <Cell
                                                            key={
                                                                `cell-${index}`
                                                            }
                                                            fill={
                                                                PIE_COLORS[
                                                                    index %
                                                                    PIE_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}

                                            </Pie>

                                            <Tooltip
                                                formatter={(value) =>
                                                    `₹${Number(value).toLocaleString()}`
                                                }
                                            />

                                        </PieChart>

                                    </ResponsiveContainer>


                                    <div className="space-y-1.5 text-xs flex-1 min-w-0">

                                        {summary.categoryData.map(
                                            (item, index) => (

                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >

                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                PIE_COLORS[
                                                                    index %
                                                                    PIE_COLORS.length
                                                                ]
                                                        }}
                                                    />

                                                    <span className="text-gray-600 dark:text-slate-300 truncate">

                                                        {item.name}:{' '}

                                                        <strong>
                                                            ₹
                                                            {item.value.toLocaleString()}
                                                        </strong>

                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>
                )}


            {/* Expenditure Details */}
            {summary?.expenditureDetails?.length > 0 && (

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow overflow-hidden">

                    <div className="p-4 border-b border-gray-100 dark:border-slate-800">

                        <h3 className="text-sm font-extrabold text-gray-700 dark:text-white">
                            Recent Expenditure Details
                        </h3>

                        <p className="text-[10px] text-gray-400 mt-1">
                            Detailed information about where temple funds were spent
                        </p>

                    </div>


                    <div className="divide-y divide-gray-100 dark:divide-slate-800">

                        {summary.expenditureDetails.map(
                            expense => (

                                <div
                                    key={expense._id}
                                    className="p-4 hover:bg-rose-50/30 dark:hover:bg-slate-800/30"
                                >

                                    <div className="flex justify-between gap-4">

                                        <div className="min-w-0">

                                            <div className="flex items-center gap-2">

                                                {typeBadge(
                                                    'Expenditure'
                                                )}

                                                <span className="text-[10px] text-gray-400">

                                                    {new Date(
                                                        expense.date
                                                    ).toLocaleDateString(
                                                        'en-IN'
                                                    )}

                                                </span>

                                            </div>


                                            <p className="font-bold text-sm text-gray-800 dark:text-white mt-1">
                                                {expense.category}
                                            </p>


                                            {expense.expenseDetails && (

                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                                    {expense.expenseDetails}
                                                </p>

                                            )}


                                            <div className="flex flex-wrap gap-2 mt-2">

                                                {expense.paymentMethod && (
                                                    <span className="text-[9px] bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                        {expense.paymentMethod}
                                                    </span>
                                                )}

                                                {expense.personOrOrg && (
                                                    <span className="text-[9px] bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                        {expense.personOrOrg}
                                                    </span>
                                                )}

                                                {expense.referenceNo && (
                                                    <span className="text-[9px] bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                        Ref: {expense.referenceNo}
                                                    </span>
                                                )}

                                            </div>


                                            {expense.receiptUrl && (

                                                <a
                                                    href={expense.receiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-rose-600 hover:underline"
                                                >
                                                    <Receipt className="h-3 w-3" />
                                                    View Receipt
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>

                                            )}

                                        </div>


                                        <div className="text-right shrink-0">

                                            <p className="font-extrabold text-rose-600">
                                                −₹
                                                {expense.amount.toLocaleString()}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>
            )}


            {/* Transaction count */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">

                <span className="font-bold">
                    {pagination.total} transaction
                    {pagination.total !== 1
                        ? 's'
                        : ''}{' '}
                    found
                </span>

            </div>


            {/* Mobile */}
            <div className="md:hidden space-y-3">

                {loading
                    ? [1, 2, 3].map(
                        i => (
                            <Skeleton
                                key={i}
                                className="h-24 rounded-2xl"
                            />
                        )
                    )

                    : records.length === 0
                        ? (
                            <p className="text-center text-slate-400 text-sm py-10">
                                No records found.
                            </p>
                        )

                        : records.map(record => (

                            <div
                                key={record._id}
                                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow"
                            >

                                <div className="flex justify-between gap-2">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-2">

                                            {typeBadge(
                                                record.type
                                            )}

                                            <span className="text-[9px] text-gray-400">
                                                {new Date(
                                                    record.date
                                                ).toLocaleDateString(
                                                    'en-IN'
                                                )}
                                            </span>

                                        </div>

                                        <p className="font-bold text-sm text-gray-800 dark:text-white truncate mt-1">
                                            {record.personOrOrg ||
                                                record.category}
                                        </p>

                                        <p className="text-[10px] text-gray-400 truncate">
                                            {record.category} •{' '}
                                            {record.paymentMethod}
                                        </p>


                                        {record.type ===
                                            'Expenditure' &&
                                            record.expenseDetails && (

                                                <p className="text-[10px] text-gray-500 mt-2">
                                                    {record.expenseDetails}
                                                </p>

                                            )}


                                        {record.receiptUrl && (

                                            <a
                                                href={
                                                    record.receiptUrl
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-2"
                                            >
                                                <Receipt className="h-3 w-3" />
                                                Receipt
                                            </a>

                                        )}

                                    </div>


                                    <div className="text-right shrink-0">

                                        <p
                                            className={`font-extrabold text-base ${
                                                record.type ===
                                                'Expenditure'
                                                    ? 'text-rose-600'
                                                    : 'text-emerald-600'
                                            }`}
                                        >
                                            {record.type ===
                                            'Expenditure'
                                                ? '−'
                                                : '+'}
                                            ₹
                                            {record.amount.toLocaleString()}
                                        </p>


                                        <div className="flex gap-1 mt-1">

                                            <button
                                                onClick={() => {
                                                    setEditRecord(
                                                        record
                                                    );
                                                    setShowModal(
                                                        true
                                                    );
                                                }}
                                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>


                                            <button
                                                onClick={() =>
                                                    setDeleteTarget(
                                                        record
                                                    )
                                                }
                                                className="p-1.5 rounded-lg bg-red-50 text-red-600"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                }

            </div>


            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full text-xs">

                        <thead className="bg-amber-50 dark:bg-slate-800">

                            <tr>

                                {[
                                    {
                                        key: 'date',
                                        label: 'Date'
                                    },
                                    {
                                        key: 'type',
                                        label: 'Type'
                                    },
                                    {
                                        key: 'category',
                                        label: 'Category'
                                    },
                                    {
                                        key: 'personOrOrg',
                                        label: 'Person / Org'
                                    },
                                    {
                                        key: 'paymentMethod',
                                        label: 'Payment'
                                    },
                                    {
                                        key: 'amount',
                                        label: 'Amount (₹)'
                                    },
                                    {
                                        key: 'referenceNo',
                                        label: 'Ref No.'
                                    },
                                    {
                                        key: null,
                                        label: 'Receipt'
                                    },
                                    {
                                        key: null,
                                        label: 'Actions'
                                    }
                                ].map(
                                    ({
                                        key,
                                        label
                                    }) => (

                                        <th
                                            key={label}
                                            className="px-4 py-3 text-left font-bold whitespace-nowrap"
                                        >

                                            {key ? (

                                                <button
                                                    onClick={() =>
                                                        handleSort(
                                                            key
                                                        )
                                                    }
                                                    className="flex items-center gap-1"
                                                >

                                                    {label}

                                                    {sortBy ===
                                                        key && (
                                                            <ArrowUpDown className="h-3 w-3 text-amber-500" />
                                                        )}

                                                </button>

                                            ) : (
                                                label
                                            )}

                                        </th>

                                    )
                                )}

                            </tr>

                        </thead>


                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="p-6"
                                    >
                                        <Skeleton className="h-8 w-full" />
                                    </td>

                                </tr>

                            ) : records.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="p-8 text-center text-slate-400"
                                    >
                                        No records found.
                                    </td>

                                </tr>

                            ) : (

                                records.map(record => (

                                    <tr
                                        key={record._id}
                                        className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30"
                                    >

                                        <td className="px-4 py-3 whitespace-nowrap">

                                            <div className="flex items-center gap-1.5">

                                                <Calendar className="h-3 w-3 text-gray-300" />

                                                {new Date(
                                                    record.date
                                                ).toLocaleDateString(
                                                    'en-IN'
                                                )}

                                            </div>

                                        </td>


                                        <td className="px-4 py-3">
                                            {typeBadge(
                                                record.type
                                            )}
                                        </td>


                                        <td className="px-4 py-3">

                                            <span className="bg-gray-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded-full text-[9px]">
                                                {record.category}
                                            </span>

                                            {record.type ===
                                                'Expenditure' &&
                                                record.expenseDetails && (

                                                    <p
                                                        className="text-[9px] text-gray-400 max-w-[180px] truncate mt-1"
                                                        title={
                                                            record.expenseDetails
                                                        }
                                                    >
                                                        {
                                                            record.expenseDetails
                                                        }
                                                    </p>

                                                )}

                                        </td>


                                        <td className="px-4 py-3 font-bold max-w-[150px] truncate">
                                            {record.personOrOrg ||
                                                '—'}
                                        </td>


                                        <td className="px-4 py-3 text-gray-500">
                                            {
                                                record.paymentMethod
                                            }
                                        </td>


                                        <td
                                            className={`px-4 py-3 font-extrabold ${
                                                record.type ===
                                                'Expenditure'
                                                    ? 'text-rose-600'
                                                    : 'text-emerald-700'
                                            }`}
                                        >
                                            {record.type ===
                                            'Expenditure'
                                                ? '−'
                                                : '+'}
                                            ₹
                                            {record.amount.toLocaleString()}
                                        </td>


                                        <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                                            {record.referenceNo ||
                                                '—'}
                                        </td>


                                        <td className="px-4 py-3">

                                            {record.receiptUrl ? (

                                                <a
                                                    href={
                                                        record.receiptUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="View Receipt"
                                                    className="inline-flex items-center gap-1 p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                >
                                                    <Receipt className="h-3 w-3" />
                                                </a>

                                            ) : (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}

                                        </td>


                                        <td className="px-4 py-3">

                                            <div className="flex gap-1">

                                                <button
                                                    onClick={() => {
                                                        setEditRecord(
                                                            record
                                                        );
                                                        setShowModal(
                                                            true
                                                        );
                                                    }}
                                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600"
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            record
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* Pagination */}
            {pagination.pages > 1 && (

                <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                        Page {pagination.page} of{' '}
                        {pagination.pages}
                    </span>

                    <div className="flex gap-1">

                        <button
                            onClick={() =>
                                fetchData(
                                    pagination.page - 1
                                )
                            }
                            disabled={
                                pagination.page <= 1
                            }
                            className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>


                        <button
                            onClick={() =>
                                fetchData(
                                    pagination.page + 1
                                )
                            }
                            disabled={
                                pagination.page >=
                                pagination.pages
                            }
                            className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                    </div>

                </div>
            )}


            {/* Modals */}
            <RecordModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditRecord(null);
                }}
                onSave={handleSave}
                initial={editRecord}
            />


            <DeleteModal
                isOpen={!!deleteTarget}
                onClose={() =>
                    setDeleteTarget(null)
                }
                onConfirm={handleDelete}
                loading={deleting}
            />

        </AdminPageLayout>
    );
};


export default FinancialsManager;