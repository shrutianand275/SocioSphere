import { useEffect, useState } from 'react';
import {
    FaWallet,
    FaReceipt,
    FaChartPie,
    FaSearch,
    FaEye,
    FaTimes,
    FaSync
} from 'react-icons/fa';

import ResidentLayout from '../../components/dashboard/ResidentLayout';

import {
    getExpenses,
    getExpenseStats
} from '../../services/expenseApi';

function ResidentExpenses() {
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
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    const [selectedExpense, setSelectedExpense] = useState(null);

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
                    category,
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
                'Unable to load society expenses.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, category, startDate, endDate, page]);

    const resetFilters = () => {
        setSearch('');
        setCategory('All');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    return (
        <ResidentLayout>
            <div className="container-fluid py-3 expense-page">

                {/* Page Header */}
                <div className="mb-4">
                    <h2 className="fw-bold mb-1">
                        Society Expenses
                    </h2>

                    <p className="text-muted mb-0">
                        View society expenditure and financial transparency.
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                        <button
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={fetchData}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted mb-1">
                                            Total Society Expenses
                                        </p>

                                        <h3 className="fw-bold">
                                            {formatCurrency(
                                                stats.overview?.totalExpenses
                                            )}
                                        </h3>
                                    </div>

                                    <FaWallet className="fs-2 text-primary" />
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
                                            Total Expense Records
                                        </p>

                                        <h3 className="fw-bold">
                                            {stats.overview?.totalRecords || 0}
                                        </h3>
                                    </div>

                                    <FaReceipt className="fs-2 text-success" />
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

                                    <FaChartPie className="fs-2 text-warning" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Category Summary */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">

                        <h5 className="fw-bold mb-3">
                            Expense Breakdown by Category
                        </h5>

                        <div className="row g-3">

                            {stats.categorySummary?.length > 0 ? (
                                stats.categorySummary.map((item) => (
                                    <div
                                        className="col-sm-6 col-lg-3"
                                        key={item._id}
                                    >
                                        <div className="p-3 bg-light rounded h-100">

                                            <div className="text-muted small">
                                                {item._id}
                                            </div>

                                            <h5 className="fw-bold mb-1">
                                                {formatCurrency(item.totalAmount)}
                                            </h5>

                                            <small className="text-muted">
                                                {item.count} expense records
                                            </small>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12">
                                    <p className="text-muted mb-0">
                                        No expense breakdown available.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">

                        <div className="row g-3">

                            <div className="col-lg-3">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FaSearch />
                                    </span>

                                    <input
                                        type="text"
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

                            <div className="col-lg-3">
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="All">
                                        All Categories
                                    </option>

                                    {categories.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
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
                                />
                            </div>

                            <div className="col-lg-2">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={resetFilters}
                                >
                                    <FaSync className="me-2" />
                                    Reset
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Expense Records */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Society Expense Records
                                </h5>

                                <small className="text-muted">
                                    Read-only financial information
                                </small>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" />
                                <p className="text-muted mt-2">
                                    Loading expense records...
                                </p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="text-center py-5">
                                <FaReceipt className="fs-1 text-muted mb-3" />

                                <h5>No expenses available</h5>

                                <p className="text-muted">
                                    Society expense records will appear here.
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
                                            <th>Details</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {expenses.map((expense) => (
                                            <tr key={expense._id}>

                                                <td>
                                                    <strong>
                                                        {expense.title}
                                                    </strong>
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
                                                            View Receipt
                                                        </a>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            setSelectedExpense(expense)
                                                        }
                                                    >
                                                        <FaEye className="me-1" />
                                                        View
                                                    </button>
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

                                <small className="text-muted">
                                    {pagination.total} total records
                                </small>

                                <div className="d-flex gap-2 align-items-center">

                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </button>

                                    <span className="small">
                                        {page} / {pagination.totalPages}
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

                {/* Expense Details Modal */}
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

                                <div className="col-md-6">
                                    <small className="text-muted">Expense Title</small>
                                    <h6>{selectedExpense.title}</h6>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">Category</small>
                                    <h6>{selectedExpense.category}</h6>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">Amount</small>
                                    <h5 className="text-primary">
                                        {formatCurrency(selectedExpense.amount)}
                                    </h5>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">Expense Date</small>
                                    <h6>
                                        {new Date(
                                            selectedExpense.expenseDate
                                        ).toLocaleDateString('en-IN')}
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <small className="text-muted">Vendor</small>
                                    <h6>{selectedExpense.vendor || '—'}</h6>
                                </div>

                                <div className="col-12">
                                    <small className="text-muted">Description</small>
                                    <p>
                                        {selectedExpense.description || 'No description available.'}
                                    </p>
                                </div>

                                <div className="col-12">
                                    <small className="text-muted">Recorded By</small>
                                    <h6>
                                        {selectedExpense.createdBy?.fullName || '—'}
                                    </h6>
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

                            <div className="text-end mt-4">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedExpense(null)}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </ResidentLayout>
    );
}

export default ResidentExpenses;