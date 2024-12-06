import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import LoginCallback from './components/LoginCallback';
import Dashboard from './components/Dashboard';
import SentimentAnalysis from './components/SentimentAnalysis'; // Importing SentimentAnalysis component
import Album from "./components/Album";


const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Home/Login Route */}
                <Route path="/" element={<Login />} />

                {/* Pinterest OAuth Callback */}
                <Route path="/auth/pinterest/callback" element={<LoginCallback />} />

                {/* Dashboard Route */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Sentiment Analysis Route */}
                <Route path="/sentiment-analysis/:pinId" element={<SentimentAnalysis />} />

                <Route path="/album" element={<Album />} />


                {/* Uncomment these routes if you need them */}
                {/*<Route path="/pdf-report/:pinId" element={<PDFReport />} />*/}
                {/*<Route path="/album/:pinId" element={<Album />} />*/}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
