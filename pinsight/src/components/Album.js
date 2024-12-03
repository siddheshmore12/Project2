import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Dashboard from "./Dashboard";
import {Button} from "react-bootstrap";
// import './Album.css'; // Create a CSS file for album styling

const Album = () => {
    const [albums, setAlbums] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const accessToken = urlParams.get('accessToken');
            if (!accessToken) {
                setError('Access token is missing in the URL. Please try again.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/fetch-albums', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                setAlbums(response.data);
            } catch (err) {
                console.error('Error fetching albums:', err.response?.data || err.message);
                setError('Failed to fetch albums. Please check your access token or try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    if (loading) {
        return <div className="loading-container">Loading albums...</div>;
    }



    return (
        <div className="album-container">
            <h1>Image Albums</h1>
            {error && <p className="error-message">{error}</p>}
            {Object.keys(albums).length > 0 ? (
                <div className="albums-grid">
                    {Object.keys(albums).map((category) => (
                        <div key={category} className="album-card">
                            <h2 className="album-title">{category}</h2>
                            <div className="album-images" style={{ display: 'flex', flexWrap: 'wrap'}}>
                                {albums[category].map((pin) => (
                                    <div key={pin.id} className="album-image-card" >
                                        {pin.media && pin.media.images && pin.media.images['600x'] ? (
                                            <img
                                                src={pin.media.images['600x'].url}
                                                alt={pin.title || 'Pinterest Pin'}
                                                className="album-image"
                                                style={{width: '300px', margin: '10px'}}
                                            />
                                        ) : (
                                            <p>No image available</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No albums available.</p>

            )}
            <Button>
                <Link to="/" className="nav-button veiwAlbumBg">
                    Logout
                </Link>
            </Button>
        </div>
    );
};

export default Album;
