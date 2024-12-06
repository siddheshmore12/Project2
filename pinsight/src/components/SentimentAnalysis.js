// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import axios from 'axios';
// // import { jsPDF } from 'jspdf';
// //
// // const SentimentAnalysis = () => {
// //     const { pinId } = useParams(); // Get pinId from URL params
// //     const [sentimentData, setSentimentData] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState(null);
// //
// //     useEffect(() => {
// //         const query = new URLSearchParams(window.location.search);
// //         const accessToken = query.get('accessToken');
// //         const pinIdFromUrl = query.get('pinId') || pinId;  // Get pinId from URL or fallback to pinId from params
// //
// //         if (accessToken && pinIdFromUrl) {
// //             // Send the accessToken and pinId to the backend
// //             axios.post(
// //                 'http://localhost:5000/sentiment-analysis',  // Make sure the backend URL is correct
// //                 { pinId: pinIdFromUrl },  // Pass the pinId in the body
// //                 { headers: { Authorization: `Bearer ${accessToken}` } }
// //             )
// //                 .then((response) => {
// //                     if (response.data && response.data.length > 0) {
// //                         setSentimentData(response.data);  // Set the sentiment data if available
// //                     } else {
// //                         setError('No sentiment data found for this pin.');
// //                     }
// //                     setLoading(false);
// //                 })
// //                 .catch((error) => {
// //                     console.error('Error fetching sentiment data:', error);
// //                     setError('Failed to fetch sentiment data. Please try again later.');
// //                     setLoading(false);
// //                 });
// //         } else {
// //             setError('No access token or pin ID found. Please log in again.');
// //             setLoading(false);
// //         }
// //     }, [pinId]);  // Dependency array ensures the effect runs when pinId changes
// //
// //     const generatePDF = () => {
// //         const doc = new jsPDF();
// //         doc.setFontSize(16);
// //         doc.text("Sentiment Analysis Report", 20, 20);
// //
// //         if (sentimentData && sentimentData.length > 0) {
// //             sentimentData.forEach((data, index) => {
// //                 doc.text(`Joy: ${data.joy}%`, 20, 30 + (index * 30));
// //                 doc.text(`Anger: ${data.anger}%`, 20, 40 + (index * 30));
// //                 doc.text(`Sorrow: ${data.sorrow}%`, 20, 50 + (index * 30));
// //                 doc.text(`Surprise: ${data.surprise}%`, 20, 60 + (index * 30));
// //                 doc.text(`Mood: ${data.mood}`, 20, 70 + (index * 30));
// //             });
// //         } else {
// //             doc.text("No sentiment data available.", 20, 30);
// //         }
// //
// //         doc.save('sentiment-analysis-report.pdf');  // Save the generated PDF
// //     };
// //     // Show loading state
// //     if (loading) {
// //         return <div>Loading...</div>;
// //     }
// //
// //     // Show error message if an error occurs
// //     if (error) {
// //         return <div>{error}</div>;
// //     }
// //
// //     // Render the sentiment analysis results
// //     return (
// //         <div className="sentiment-analysis-container">
// //             <h1>SENTIMENT ANALYSIS FOR PIN {pinId}</h1>
// //             {sentimentData ? (
// //                 sentimentData.map((data, index) => (
// //                     <div key={index}>
// //                         <p><strong>Joy:</strong> {data.joy}%</p>
// //                         <p><strong>Anger:</strong> {data.anger}%</p>
// //                         <p><strong>Sorrow:</strong> {data.sorrow}%</p>
// //                         <p><strong>Surprise:</strong> {data.surprise}%</p>
// //                         <p><strong>Mood:</strong> {data.mood}</p>
// //                     </div>
// //                 ))
// //             ) : (
// //                 <div>No sentiment data available for this pin.</div>
// //             )}
// //             <button onClick={generatePDF} className="generate-pdf-button">Generate PDF</button>
// //         </div>
// //     );
// // };
// //
// // export default SentimentAnalysis;
//
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import ProgressBar from 'react-bootstrap/ProgressBar';

const SentimentAnalysis = () => {
    const { pinId } = useParams(); // Get pinId from URL params
    const [sentimentData, setSentimentData] = useState(null);
    const [movieSuggestions, setMovieSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const accessToken = query.get('accessToken');
        const pinIdFromUrl = query.get('pinId') || pinId; // Get pinId from URL or fallback to pinId from params

        if (accessToken && pinIdFromUrl) {
            // Send the accessToken and pinId to the backend
            axios.post(
                'https://pinsight-backend-467347019902.us-central1.run.app/sentiment-analysis', // Make sure the backend URL is correct
                { pinId: pinIdFromUrl }, // Pass the pinId in the body
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
                .then((response) => {
                    const { analysis, movieSuggestions } = response.data;
                    if (analysis && analysis.length > 0) {
                        setSentimentData(analysis); // Set the sentiment data
                        setMovieSuggestions(movieSuggestions || []); // Set movie suggestions
                    } else {
                        setError('No sentiment data found for this pin.');
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching sentiment data:', error);
                    setError('Failed to fetch sentiment data. Please try again later.');
                    setLoading(false);
                });
        } else {
            setError('No access token or pin ID found. Please log in again.');
            setLoading(false);
        }
    }, [pinId]); // Dependency array ensures the effect runs when pinId changes

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Sentiment Analysis Report", 20, 20);

        if (sentimentData && sentimentData.length > 0) {
            sentimentData.forEach((data, index) => {
                doc.text(`Joy: ${data.joy}%`, 20, 30 + (index * 30));
                doc.text(`Anger: ${data.anger}%`, 20, 40 + (index * 30));
                doc.text(`Sorrow: ${data.sorrow}%`, 20, 50 + (index * 30));
                doc.text(`Surprise: ${data.surprise}%`, 20, 60 + (index * 30));
                doc.text(`Mood: ${data.mood}`, 20, 70 + (index * 30));
            });

            if (movieSuggestions.length > 0) {
                doc.addPage();
                doc.text("Movie Suggestions", 20, 20);
                movieSuggestions.forEach((movie, index) => {
                    doc.text(`${index + 1}. ${movie.title} (${movie.year})`, 20, 30 + (index * 10));
                });
            }
        } else {
            doc.text("No sentiment data available.", 20, 30);
        }

        doc.save('sentiment-analysis-report.pdf'); // Save the generated PDF
    };

    // Show loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Show error message if an error occurs
    if (error) {
        return <div>{error}</div>;
    }

    // Render the sentiment analysis results
    return (
        <div className="sentiment-analysis-container">
            <h1>SENTIMENT ANALYSIS FOR PIN {pinId}</h1>
            {sentimentData ? (
                sentimentData.map((data, index) => (
                    <div key={index} className="sentiment-data">
                        <p><strong>Joy:</strong></p>
                        <ProgressBar now={data.joy} label={`${data.joy}%`} />

                        <p><strong>Anger:</strong></p>
                        <ProgressBar variant="danger" now={data.anger} label={`${data.anger}%`} />

                        <p><strong>Sorrow:</strong></p>
                        <ProgressBar variant="info" now={data.sorrow} label={`${data.sorrow}%`} />

                        <p><strong>Surprise:</strong></p>
                        <ProgressBar variant="warning" now={data.surprise} label={`${data.surprise}%`} />

                        <p><strong>Mood:</strong> {data.mood}</p>
                    </div>
                ))
            ) : (
                <div>No sentiment data available for this pin.</div>
            )}

            <h2>Movie Suggestions</h2>
            {movieSuggestions.length > 0 ? (
                <ul className="movie-suggestions">
                    {movieSuggestions.map((movie, index) => (
                        <li key={index}>
                            <a href={movie.imdbLink} target="_blank" rel="noopener noreferrer">
                                {movie.title} ({movie.year})
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No movie suggestions available for this mood.</p>
            )}

            <button onClick={generatePDF} className="generate-pdf-button">Generate PDF</button>
        </div>
    );
};

export default SentimentAnalysis;


