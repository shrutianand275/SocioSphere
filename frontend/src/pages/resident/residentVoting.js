import { useEffect, useState } from 'react';

import {
    FaVoteYea,
    FaClock,
    FaCheckCircle,
    FaUsers,
    FaChartBar,
    FaSyncAlt
} from 'react-icons/fa';

import ResidentLayout from '../../components/dashboard/ResidentLayout';

import {
    getVotings,
    submitVote,
    getVotingResults
} from '../../services/votingApi';


const ResidentVoting = () => {

    const [votings, setVotings] = useState([]);

    const [selectedOptions, setSelectedOptions] = useState({});

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState('');

    const [selectedResults, setSelectedResults] = useState(null);

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');


    // FETCH ACTIVE POLLS

    const fetchVotings = async () => {

        try {

            setLoading(true);

            setError('');

            const data = await getVotings();

            setVotings(data.votings || []);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load voting polls.'
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {
        fetchVotings();
    }, []);


    // SELECT OPTION

    const handleSelect = (votingId, optionId) => {

        setSelectedOptions(previous => ({
            ...previous,
            [votingId]: optionId
        }));

    };


    // SUBMIT VOTE

    const handleVote = async (voting) => {

        const optionId = selectedOptions[voting._id];

        if (!optionId) {

            setError('Please select an option before voting.');

            return;

        }

        if (!window.confirm('Are you sure you want to submit your vote?')) {
            return;
        }

        try {

            setSubmitting(voting._id);

            setError('');

            setMessage('');

            await submitVote(voting._id, optionId);

            setMessage('Your vote has been submitted successfully!');

            setSelectedOptions(previous => ({
                ...previous,
                [voting._id]: ''
            }));

            await fetchVotings();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to submit your vote.'
            );

        } finally {

            setSubmitting('');

        }

    };


    // VIEW RESULTS

    const handleResults = async (id) => {

        try {

            const data = await getVotingResults(id);

            setSelectedResults(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load poll results.'
            );

        }

    };


    return (

        <ResidentLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Voting & Polls</h2>

                    <p>
                        Participate in society decisions and share your opinion.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchVotings}
                >
                    <FaSyncAlt /> Refresh
                </button>

            </div>


            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            {loading ? (

                <div className="dashboard-loading">
                    Loading available polls...
                </div>

            ) : votings.length === 0 ? (

                <div className="empty-state">
                    <FaVoteYea />
                    <h3>No active polls available</h3>
                    <p>Check again later for new society polls.</p>
                </div>

            ) : (

                <div className="resident-voting-grid">

                    {votings.map((voting) => (

                        <div
                            className="resident-voting-card"
                            key={voting._id}
                        >

                            <div className="resident-voting-header">

                                <div className="resident-voting-icon">
                                    <FaVoteYea />
                                </div>

                                <span className="voting-category">
                                    {voting.category}
                                </span>

                            </div>


                            <h3>{voting.title}</h3>

                            <p className="resident-voting-description">
                                {voting.description}
                            </p>


                            <div className="resident-voting-meta">

                                <span>
                                    <FaClock />
                                    Ends: {' '}
                                    {new Date(
                                        voting.endDate
                                    ).toLocaleDateString('en-IN')}
                                </span>

                                <span>
                                    <FaUsers />
                                    {voting.totalVotes || 0} votes
                                </span>

                            </div>


                            <div className="resident-voting-options">

                                <h4>Select your option</h4>

                                {voting.options.map((option) => (

                                    <label
                                        className={`resident-voting-option ${
                                            selectedOptions[voting._id] === option._id
                                                ? 'selected'
                                                : ''
                                        }`}
                                        key={option._id}
                                    >

                                        <input
                                            type="radio"
                                            name={`poll-${voting._id}`}
                                            value={option._id}
                                            checked={
                                                selectedOptions[voting._id] === option._id
                                            }
                                            disabled={voting.hasVoted}
                                            onChange={() =>
                                                handleSelect(
                                                    voting._id,
                                                    option._id
                                                )
                                            }
                                        />

                                        <span>{option.text}</span>

                                    </label>

                                ))}

                            </div>


                            {voting.hasVoted ? (

                                <div className="voting-already-submitted">
                                    <FaCheckCircle />
                                    You have already voted.
                                </div>

                            ) : (

                                <button
                                    className="resident-submit-vote"
                                    disabled={submitting === voting._id}
                                    onClick={() => handleVote(voting)}
                                >
                                    {submitting === voting._id
                                        ? 'Submitting...'
                                        : 'Submit Vote'}
                                </button>

                            )}


                            {voting.showResults && (

                                <button
                                    className="resident-view-results"
                                    onClick={() => handleResults(voting._id)}
                                >
                                    <FaChartBar />
                                    View Results
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            )}


            {/* RESULTS MODAL */}

            {selectedResults && (

                <div
                    className="voting-modal-overlay"
                    onClick={() => setSelectedResults(null)}
                >

                    <div
                        className="voting-results-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="voting-form-heading">

                            <h3>{selectedResults.title}</h3>

                            <button
                                onClick={() => setSelectedResults(null)}
                            >
                                ×
                            </button>

                        </div>


                        <h4>
                            Total Votes: {selectedResults.totalVotes}
                        </h4>


                        {selectedResults.results.map((result) => (

                            <div
                                className="voting-result-item"
                                key={result.optionId}
                            >

                                <div className="voting-result-label">
                                    <strong>{result.text}</strong>

                                    <span>
                                        {result.votes} votes
                                        ({result.percentage}%)
                                    </span>
                                </div>

                                <div className="voting-progress">

                                    <div
                                        style={{
                                            width: `${result.percentage}%`
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </ResidentLayout>

    );

};

export default ResidentVoting;