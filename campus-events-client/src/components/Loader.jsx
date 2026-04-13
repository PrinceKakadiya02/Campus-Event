const Loader = () => {
    return (
        <div className="loader-overlay">
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', fontWeight: 600, color: '#4e73df' }}>Processing...</p>
        </div>
    );
};

export default Loader;