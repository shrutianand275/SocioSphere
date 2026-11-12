import { useEffect, useState } from 'react';
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaTimes,
    FaWallet,
    FaReceipt,
    FaChartPie,
    FaEye,
    FaSync
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getExpenses,
    getExpenseStats,
    createExpense,
    updateExpense,
    deleteExpense
} from '../../services/expenseApi';

import '../../styles/AdminDashboard.css';

const categories = [
    'Maintenance',
    'Security',
    'Electricity',
    'Water',
    'Cleaning',
    'Repair',
    'Gardening',
    'Staff Salary',
    'Lift Maintenance',
    'Other'
];

const initialForm = {
    title: '',
    description: '',
    category: 'Maintenance',
    amount: '',
    vendor: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    receiptUrl: ''
};

function ManageExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({
        overview: {
            totalExpenses: 0,
            totalRecords: 0,
            averageExpense: 0
        },
        categorySummary: []
    });

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const [form, setForm] = useState(initialForm);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount || 0);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [expenseResponse, statsResponse] = await Promise.all([
                getExpenses({
                    search,
                    category: categoryFilter,
                    startDate,
                    endDate,
                    page,
                    limit: 10
                }),
                getExpenseStats()
            ]);

            setExpenses(expenseResponse.data.expenses || []);
            setPagination(
                expenseResponse.data.pagination || {
                    total: 0,
                    totalPages: 1
                }
            );

            setStats(statsResponse.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load expenses.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, categoryFilter, startDate, endDate, page]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(initialForm);
        setShowForm(true);
        setError('');
    };

    const openEditForm = (expense) => {
        setEditingId(expense._id);

        setForm({
            title: expense.title || '',
            description: expense.description || '',
            category: expense.category || 'Maintenance',
            amount: expense.amount || '',
            vendor: expense.vendor || '',
            expenseDate: expense.expenseDate
                ? new Date(expense.expenseDate).toISOString().slice(0, 10)
                : '',
            receiptUrl: expense.receiptUrl || ''
        });

        setShowForm(true);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');

            const payload = {
                ...form,
                amount: Number(form.amount)
            };

            if (editingId) {
                await updateExpense(editingId, payload);
                setMessage('Expense updated successfully.');
            } else {
                await createExpense(payload);
                setMessage('Expense added successfully.');
            }

            setShowForm(false);
            setEditingId(null);
            setForm(initialForm);

            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to save expense.'
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this expense?'
        );

        if (!confirmed) return;

        try {
            await deleteExpense(id);
            setMessage('Expense deleted successfully.');
            await fetchData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete expense.'
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="container-fluid py-3 expense-page">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Expense Management</h2>
                        <p className="text-muted mb-0">
                            Manage and monitor society expenses.
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={openAddForm}
                    >
                        <FaPlus className="me-2" />
                        Add Expense
                    </button>
                </div>

                {message && (
                    <div className="alert alert-success alert-dismissible">
                        {message}
                        <button
                            className="btn-close"
                            onClick={() => setMessage('')}
                        />
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted mb-1">
                                            Total Expenses
                                        </p>
                                        <h3 className="fw-bold">
                                            {formatCurrency(
                                                stats.overview?.totalExpenses
                                            )}
                                        </h3>
                                    </div>
                                    <FaWallet className="text-primary fs-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted mb-1">
                                            Expense Records
                                        </p>
                                        <h3 className="fw-bold">
                                            {stats.overview?.totalRecords || 0}
                                        </h3>
                                    </div>
                                    <FaReceipt className="text-success fs-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted mb-1">
                                            Average Expense
                                        </p>
                                        <h3 className="fw-bold">
                                            {formatCurrency(
                                                stats.overview?.averageExpense
                                            )}
                                        </h3>
                                    </div>
                                    <FaChartPie className="text-warning fs-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Category Summary */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="fw-bold mb-3">
                            Category-wise Expenses
                        </h5>

                        <div className="row g-3">
                            {stats.categorySummary?.length > 0 ? (
                                stats.categorySummary.map((item) => (
                                    <div
                                        className="col-md-4 col-lg-3"
                                        key={item._id}
                                    >
                                        <div className="p-3 bg-light rounded">
                                            <div className="text-muted small">
                                                {item._id}
                                            </div>
                                            <h5 className="fw-bold mb-1">
                                                {formatCurrency(item.totalAmount)}
                                            </h5>
                                            <small className="text-muted">
                                                {item.count} records
                                            </small>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted mb-0">
                                    No expense records available.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">

                            <div className="col-lg-3">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaSearch />
                                    </span>
                                    <input
                                        className="form-control"
                                        placeholder="Search expenses..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="col-lg-2">
                                <select
                                    className="form-select"
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-lg-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPage(1);
                                    }}
                                    title="Start date"
                                />
                            </div>

                            <div className="col-lg-2">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPage(1);
                                    }}
                                    title="End date"
                                />
                            </div>

                            <div className="col-lg-3">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => {
                                        setSearch('');
                                        setCategoryFilter('All');
                                        setStartDate('');
                                        setEndDate('');
                                        setPage(1);
                                    }}
                                >
                                    <FaSync className="me-2" />
                                    Reset Filters
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Expense Table */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body">

                        <h5 className="fw-bold mb-3">
                            Society Expense Records
                        </h5>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                                <p className="mt-2 text-muted">
                                    Loading expenses...
                                </p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-5">
                                <FaReceipt className="fs-1 text-muted mb-3" />
                                <h5>No expenses found</h5>
                                <p className="text-muted">
                                    Add your first society expense.
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Expense</th>
                                            <th>Category</th>
                                            <th>Vendor</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Receipt</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {expenses.map((expense) => (
                                            <tr key={expense._id}>
                                                <td>
                                                    <strong>{expense.title}</strong>
                                                    <div className="small text-muted">
                                                        {expense.description}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="badge bg-info-subtle text-info">
                                                        {expense.category}
                                                    </span>
                                                </td>

                                                <td>
                                                    {expense.vendor || '—'}
                                                </td>

                                                <td>
                                                    {new Date(
                                                        expense.expenseDate
                                                    ).toLocaleDateString('en-IN')}
                                                </td>

                                                <td className="fw-bold">
                                                    {formatCurrency(expense.amount)}
                                                </td>

                                                <td>
                                                    {expense.receiptUrl ? (
                                                        <a
                                                            href={expense.receiptUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            View
                                                        </a>
                                                    ) : '—'}
                                                </td>

                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            title="View"
                                                            onClick={() => setSelectedExpense(expense)}
                                                        >
                                                            <FaEye />
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                            onClick={() => openEditForm(expense)}
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete"
                                                            onClick={() => handleDelete(expense._id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <span className="text-muted small">
                                    {pagination.total} total records
                                </span>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </button>

                                    <span className="align-self-center small">
                                        Page {page} of {pagination.totalPages}
                                    </span>

                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showForm && (
                    <div className="expense-modal-overlay">
                        <div className="expense-modal">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0">
                                    {editingId ? 'Edit Expense' : 'Add New Expense'}
                                </h4>

                                <button
                                    className="btn btn-light"
                                    onClick={() => setShowForm(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Expense Title *
                                        </label>
                                        <input
                                            className="form-control"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            required
                                            maxLength="150"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Category *
                                        </label>
                                        <select
                                            className="form-select"
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            required
                                        >
                                            {categories.map((category) => (
                                                <option key={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="amount"
                                            value={form.amount}
                                            onChange={handleChange}
                                            min="0.01"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Expense Date *
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="expenseDate"
                                            value={form.expenseDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Vendor / Service Provider
                                        </label>
                                        <input
                                            className="form-control"
                                            name="vendor"
                                            value={form.vendor}
                                            onChange={handleChange}
                                            maxLength="150"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Receipt URL
                                        </label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="receiptUrl"
                                            value={form.receiptUrl}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            Description
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            maxLength="1000"
                                        />
                                    </div>

                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {editingId ? 'Update Expense' : 'Save Expense'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Details Modal */}
                {selectedExpense && (
                    <div className="expense-modal-overlay">
                        <div className="expense-modal">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold mb-0">
                                    Expense Details
                                </h4>

                                <button
                                    className="btn btn-light"
                                    onClick={() => setSelectedExpense(null)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <small className="text-muted">Title</small>
                                    <h6>{selectedExpense.title}</h6>
                                </div>

                                <div className="col-6">
                                    <small className="text-muted">Category</small>
                                    <h6>{selectedExpense.category}</h6>
                                </div>

                                <div className="col-6">
                                    <small className="text-muted">Amount</small>
                                    <h5 className="text-primary">
                                        {formatCurrency(selectedExpense.amount)}
                                    </h5>
                                </div>

                                <div className="col-6">
                                    <small className="text-muted">Date</small>
                                    <h6>
                                        {new Date(selectedExpense.expenseDate).toLocaleDateString('en-IN')}
                                    </h6>
                                </div>

                                <div className="col-6">
                                    <small className="text-muted">Vendor</small>
                                    <h6>{selectedExpense.vendor || '—'}</h6>
                                </div>

                                <div className="col-12">
                                    <small className="text-muted">Description</small>
                                    <p>{selectedExpense.description || 'No description'}</p>
                                </div>

                                <div className="col-12">
                                    <small className="text-muted">Added By</small>
                                    <h6>{selectedExpense.createdBy?.fullName || '—'}</h6>
                                </div>

                                {selectedExpense.receiptUrl && (
                                    <div className="col-12">
                                        <a
                                            href={selectedExpense.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary"
                                        >
                                            <FaReceipt className="me-2" />
                                            Open Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

export default ManageExpenses;