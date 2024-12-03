import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = () => {
            const query = new URLSearchParams(window.location.search);
            const accessToken = query.get('accessToken');

            if (accessToken) {
                // Store accessToken securely (e.g., in localStorage or context)
                localStorage.setItem('accessToken', accessToken);

                // Redirect to dashboard or desired page
                navigate('/sentiment-analysis');  // Ensure redirection after successful login
            } else {
                console.error('Access token not found');
                alert('Login failed. Please try again.');
            }
        };

        handleCallback();
    }, [navigate]);

    return <div>Processing login... Please wait.</div>;
};

export default LoginCallback;
