const StatCard = ({ title, value, icon, color, description }) => {
    return (
        <div className="stat-card">

            <div className="stat-card-content">

                <div>
                    <p>{title}</p>
                    <h2>{value ?? 0}</h2>
                    <span>{description}</span>
                </div>

                <div
                    className="stat-card-icon"
                    style={{ backgroundColor: `${color}18`, color }}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
};

export default StatCard;