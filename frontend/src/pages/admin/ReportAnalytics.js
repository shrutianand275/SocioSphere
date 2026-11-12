import { useEffect, useState } from 'react';

import {
    FaUsers,
    FaExclamationCircle,
    FaBullhorn,
    FaVoteYea,
    FaWallet,
    FaChartLine,
    FaSync
} from 'react-icons/fa';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import { Bar, Doughnut, Line } from 'react-chartjs-2';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getSocietyOverview,
    getComplaintAnalytics,
    getExpenseAnalytics,
    getVotingAnalytics,
    getResidentAnalytics
} from '../../services/reportApi';

import '../../styles/AdminDashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function ReportsAnalytics() {
    const [overview, setOverview] = useState(null);
    const [complaints, setComplaints] = useState(null);
    const [expenses, setExpenses] = useState(null);
    const [voting, setVoting] = useState(null);
    const [residents, setResidents] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                overviewRes,
                complaintRes,
                expenseRes,
                votingRes,
                residentRes
            ] = await Promise.all([
                getSocietyOverview(),
                getComplaintAnalytics(),
                getExpenseAnalytics(),
                getVotingAnalytics(),
                getResidentAnalytics()
            ]);

            setOverview(overviewRes.data.overview);
            setComplaints(complaintRes.data);
            setExpenses(expenseRes.data);
            setVoting(votingRes.data);
            setResidents(residentRes.data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load reports. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const cardData = [
        {
            title: 'Total Residents',
            value: overview?.residents?.total || 0,
            icon: <FaUsers />,
            color: 'primary'
        },
        {
            title: 'Total Complaints',
            value: overview?.complaints?.total || 0,
            icon: <FaExclamationCircle />,
            color: 'danger'
        },
        {
            title: 'Total Notices',
            value: overview?.notices?.total || 0,
            icon: <FaBullhorn />,
            color: 'info'
        },
        {
            title: 'Total Polls',
            value: overview?.voting?.total || 0,
            icon: <FaVoteYea />,
            color: 'success'
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(
                overview?.expenses?.totalAmount
            ),
            icon: <FaWallet />,
            color: 'warning'
        }
    ];

    // Complaint status chart
    const complaintLabels = (complaints?.statusSummary || [])
        .map(item => item._id || 'Unknown');

    const complaintData = {
        labels: complaintLabels,
        datasets: [{
            label: 'Complaints',
            data: (complaints?.statusSummary || [])
                .map(item => item.count),
            backgroundColor: [
                '#f59e0b',
                '#3b82f6',
                '#10b981',
                '#ef4444',
                '#8b5cf6'
            ],
            borderWidth: 0
        }]
    };

    // Expense category chart
    const expenseCategoryData = {
        labels: (expenses?.categorySummary || [])
            .map(item => item._id),
        datasets: [{
            label: 'Expense Amount',
            data: (expenses?.categorySummary || [])
                .map(item => item.totalAmount),
            backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#06b6d4',
                '#ec4899',
                '#64748b'
            ],
            borderWidth: 0
        }]
    };

    // Monthly expense trend
    const monthlyExpenseData = {
        labels: (expenses?.monthlySummary || []).map(item =>
            `${new Date(item._id.year, item._id.month - 1)
                .toLocaleString('en-IN', { month: 'short' })} ${item._id.year}`
        ),
        datasets: [{
            label: 'Monthly Expenses (₹)',
            data: (expenses?.monthlySummary || [])
                .map(item => item.totalAmount),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            fill: true,
            tension: 0.35
        }]
    };

    // Resident approval chart
    const residentData = {
        labels: (residents?.residents || [])
            .map(item => item._id || 'Unknown'),
        datasets: [{
            label: 'Residents',
            data: (residents?.residents || [])
                .map(item => item.count),
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#ef4444'
            ],
            borderWidth: 0
        }]
    };

    // Monthly complaints chart
    const monthlyComplaintData = {
        labels: (complaints?.monthlySummary || []).map(item =>
            `${new Date(item._id.year, item._id.month - 1)
                .toLocaleString('en-IN', { month: 'short' })} ${item._id.year}`
        ),
        datasets: [{
            label: 'Complaints',
            data: (complaints?.monthlySummary || [])
                .map(item => item.count),
            backgroundColor: '#6366f1',
            borderRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="text-muted mt-3">
                        Generating society reports...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container-fluid py-3 reports-page">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Reports & Analytics
                        </h2>
                        <p className="text-muted mb-0">
                            Monitor society performance and financial activity.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-primary"
                        onClick={fetchReports}
                    >
                        <FaSync className="me-2" />
                        Refresh Reports
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                        <button
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={fetchReports}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Overview Cards */}
                <div className="row g-3 mb-4">
                    {cardData.map((card) => (
                        <div
                            className="col-sm-6 col-xl"
                            key={card.title}
                        >
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="text-muted small mb-2">
                                                {card.title}
                                            </p>
                                            <h4 className="fw-bold mb-0">
                                                {card.value}
                                            </h4>
                                        </div>

                                        <div className={`reports-icon text-${card.color}`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resident and Complaint Summary */}
                <div className="row g-3 mb-4">

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Resident Overview
                                </h5>

                                <div className="row text-center g-3 mb-3">
                                    <div className="col-4">
                                        <h4 className="text-success fw-bold">
                                            {overview?.residents?.approved || 0}
                                        </h4>
                                        <small className="text-muted">
                                            Approved
                                        </small>
                                    </div>

                                    <div className="col-4">
                                        <h4 className="text-warning fw-bold">
                                            {overview?.residents?.pending || 0}
                                        </h4>
                                        <small className="text-muted">
                                            Pending
                                        </small>
                                    </div>

                                    <div className="col-4">
                                        <h4 className="text-danger fw-bold">
                                            {overview?.residents?.rejected || 0}
                                        </h4>
                                        <small className="text-muted">
                                            Rejected
                                        </small>
                                    </div>
                                </div>

                                <div className="reports-chart-container">
                                    <Doughnut
                                        data={residentData}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Complaint Status
                                </h5>

                                <div className="reports-chart-container">
                                    <Doughnut
                                        data={complaintData}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Expense Analytics */}
                <div className="row g-3 mb-4">

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Category-wise Expenses
                                </h5>

                                <div className="reports-chart-container">
                                    {expenseCategoryData.labels.length > 0 ? (
                                        <Doughnut
                                            data={expenseCategoryData}
                                            options={chartOptions}
                                        />
                                    ) : (
                                        <p className="text-muted">
                                            No expense data available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Monthly Expense Trend
                                </h5>

                                <div className="reports-chart-container">
                                    {monthlyExpenseData.labels.length > 0 ? (
                                        <Line
                                            data={monthlyExpenseData}
                                            options={{
                                                ...chartOptions,
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            callback: value =>
                                                                `₹${value}`
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p className="text-muted">
                                            No monthly expense data available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Complaint Trends and Voting */}
                <div className="row g-3 mb-4">

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Monthly Complaint Trends
                                </h5>

                                <div className="reports-chart-container">
                                    {monthlyComplaintData.labels.length > 0 ? (
                                        <Bar
                                            data={monthlyComplaintData}
                                            options={chartOptions}
                                        />
                                    ) : (
                                        <p className="text-muted">
                                            No complaint data available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Voting Overview
                                </h5>

                                <div className="row g-3 text-center">
                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded">
                                            <h3 className="fw-bold">
                                                {voting?.overview?.totalPolls || 0}
                                            </h3>
                                            <small className="text-muted">
                                                Total Polls
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded">
                                            <h3 className="fw-bold text-success">
                                                {voting?.overview?.activePolls || 0}
                                            </h3>
                                            <small className="text-muted">
                                                Active Polls
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded">
                                            <h3 className="fw-bold text-secondary">
                                                {voting?.overview?.closedPolls || 0}
                                            </h3>
                                            <small className="text-muted">
                                                Closed Polls
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="p-3 bg-light rounded">
                                            <h3 className="fw-bold text-primary">
                                                {voting?.overview?.totalVotes || 0}
                                            </h3>
                                            <small className="text-muted">
                                                Total Votes
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                <h6 className="fw-bold">
                                    Poll Records
                                </h6>

                                {voting?.polls?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-sm align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Poll</th>
                                                    <th>Status</th>
                                                    <th>Votes</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {voting.polls.map((poll) => (
                                                    <tr key={poll._id}>
                                                        <td>{poll.title}</td>
                                                        <td>
                                                            <span className="badge bg-light text-dark">
                                                                {poll.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {poll.options?.reduce(
                                                                (sum, option) =>
                                                                    sum + (option.votesCount || 0),
                                                                0
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted small">
                                        No voting records available.
                                    </p>
                                )}

                            </div>
                        </div>
                    </div>

                </div>

                {/* Expense Summary */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="fw-bold mb-3">
                            Financial Summary
                        </h5>

                        <div className="row g-3">
                            <div className="col-md-4">
                                <small className="text-muted">
                                    Total Expenditure
                                </small>
                                <h4 className="fw-bold text-primary">
                                    {formatCurrency(
                                        expenses?.overview?.totalAmount
                                    )}
                                </h4>
                            </div>

                            <div className="col-md-4">
                                <small className="text-muted">
                                    Expense Records
                                </small>
                                <h4 className="fw-bold">
                                    {expenses?.overview?.totalRecords || 0}
                                </h4>
                            </div>

                            <div className="col-md-4">
                                <small className="text-muted">
                                    Average Expense
                                </small>
                                <h4 className="fw-bold">
                                    {formatCurrency(
                                        expenses?.overview?.averageAmount
                                    )}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-muted small text-end">
                    <FaChartLine className="me-1" />
                    Reports are generated from current society records.
                </div>

            </div>
        </DashboardLayout>
    );
}

export default ReportsAnalytics;