// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {Link, Route, Routes} from 'react-router-dom'; // Importing Link from React Router for navigation
// import './Dashboard.css';
// import {Button} from "react-bootstrap"; // Importing the CSS file for styling
//
// const Dashboard = () => {
//     const [pins, setPins] = useState([]); // Store an array of pins
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//
//
//     useEffect(() => {
//         const fetchPins = async () => {
//             const urlParams = new URLSearchParams(window.location.search);
//             const accessToken = urlParams.get('accessToken');
//             if (!accessToken) {
//                 setError('Access token is missing in the URL. Please try again.');
//                 setLoading(false);
//                 return;
//             }
//
//             try {
//                 const response = await axios.get('http://localhost:5000/fetch-pins', {
//                     headers: {
//                         Authorization: `Bearer ${accessToken}`,
//                     },
//                 });
//
//                 setPins(response.data);
//             } catch (err) {
//                 console.error('Error fetching pins:', err.response?.data || err.message);
//                 setError('Failed to fetch pins. Please check your access token or try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchPins();
//     }, []);
//
//     if (loading) {
//         return <div className="loading-container">Loading your pins...</div>;
//     }
//
//     // Extract the accessToken from the URL query string
//     const urlParams = new URLSearchParams(window.location.search);
//     const accessToken = urlParams.get('accessToken');
//
//
//
//     return (
//         <div className="dashboard-container">
//
//     <h1>Your Pinterest Pins</h1>
//     <Button>
//     <Link to={`/album?accessToken=${accessToken}`} className="nav-button veiwAlbumBg">
//                     View Albums →
//                 </Link>
//             </Button>
//
//             {error && <p className="error-message">{error}</p>}
//             {pins.length > 0 ? (
//                 <div className="pins-grid">
//                     {pins.map((pin) => (
//                         <div key={pin.id} className="pin-card">
//                             <h2 className="pin-title">{pin.title || 'No Title Available'}</h2>
//                             <p className="pin-description">{pin.description || 'No description available.'}</p>
//                             {pin.link ? (
//                                 <a className="pin-link" href={pin.link} target="_blank" rel="noopener noreferrer">
//                                     View Pin
//                                 </a>
//                             ) : (
//                                 <p className="pin-link">No link available for this pin.</p>
//                             )}
//                             {pin.media && pin.media.images && pin.media.images['600x'] ? (
//                                 <div className="pin-image">
//                                     <img
//                                         src={pin.media.images['600x'].url}
//                                         alt={pin.title || 'Pinterest Pin'}
//                                         className="pin-image-img"
//                                     />
//                                 </div>
//                             ) : (
//                                 <p>No image available for this pin.</p>
//                             )}
//
//                             {/* Hover Options */}
//                             <div className="hover-options">
//                                 {/* Updated link to pass pinId and accessToken to sentiment analysis */}
//                                 <Link
//                                     to={`/sentiment-analysis/${pin.id}?accessToken=${accessToken}`}
//                                     className="hover-option"
//                                 >
//                                     Sentimental Analysis
//                                 </Link>
//
//                                 {/*<Link to={`/pdf-report/${pin.id}`} className="hover-option">PDF Report</Link>*/}
//                                 {/*<Link to={`/album/${pin.id}`} className="hover-option">Album</Link>*/}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p>No pins available. Ensure the correct access token is provided.</p>
//             )}
//         </div>
//     );
// };
//
// export default Dashboard;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Importing Link from React Router for navigation
import "./Dashboard.css";
import { Button } from "react-bootstrap"; // Importing the CSS file for styling

const Dashboard = () => {
    const [pins, setPins] = useState([]); // Store an array of pins
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false); // Prevent infinite fetch

    useEffect(() => {
        const fetchPins = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get("accessToken");
            if (!accessToken) {
                setError("Access token is missing in the URL. Please try again.");
                setLoading(false);
                return;
            }

            try {
                // Prevent multiple calls
                if (hasFetched) return;

                const response = await axios.get("https://pinsight-backend-467347019902.us-central1.run.app/fetch-pins", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setPins(response.data);
                setHasFetched(true); // Mark as fetched
            } catch (err) {
                console.error("Error fetching pins:", err.response?.data || err.message);
                setError(
                    "Failed to fetch pins. Please check your access token or try again later."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPins();
    }, [hasFetched]); // Dependency on `hasFetched`

    if (loading) {
        return <div className="loading-container">Loading your pins...</div>;
    }

    // Extract the accessToken from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");

    return (
        <div className="dashboard-container">
            <h1>Your Pinterest Pins</h1>
            <Button>
                <Link
                    to={`/album?accessToken=${accessToken}`}
                    className="nav-button veiwAlbumBg"
                >
                    View Albums →
                </Link>
            </Button>

            {error && <p className="error-message">{error}</p>}
            {pins.length > 0 ? (
                <div className="pins-grid">
                    {pins.map((pin) => (
                        <div key={pin.id} className="pin-card">
                            <h2 className="pin-title">{pin.title || "No Title Available"}</h2>
                            <p className="pin-description">
                                {pin.description || "No description available."}
                            </p>
                            {pin.link ? (
                                <a
                                    className="pin-link"
                                    href={pin.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Pin
                                </a>
                            ) : (
                                <p className="pin-link">No link available for this pin.</p>
                            )}
                            {pin.media && pin.media.images && pin.media.images["600x"] ? (
                                <div className="pin-image">
                                    <img
                                        src={pin.media.images["600x"].url}
                                        alt={pin.title || "Pinterest Pin"}
                                        className="pin-image-img"
                                    />
                                </div>
                            ) : (
                                <p>No image available for this pin.</p>
                            )}

                            {/* Hover Options */}
                            <div className="hover-options">
                                {/* Updated link to pass pinId and accessToken to sentiment analysis */}
                                <Link
                                    to={`/sentiment-analysis/${pin.id}?accessToken=${accessToken}`}
                                    className="hover-option"
                                >
                                    Sentimental Analysis
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No pins available. Ensure the correct access token is provided.</p>
            )}
        </div>
    );
};

export default Dashboard;

