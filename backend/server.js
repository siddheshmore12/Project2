const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto'); // For generating a secure state parameter
const { URLSearchParams } = require('url');
const { db } = require('./firebase-setup'); // Firebase setup file
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { LanguageServiceClient } = require('@google-cloud/language');
const client = new ImageAnnotatorClient({
    keyFilename: './pinsight-e497f71da1a1.json',  // Explicitly set the path to your JSON key
});

// Initialize the Google Cloud clients
const visionClient = new ImageAnnotatorClient();
const languageClient = new LanguageServiceClient();

const apiKey = 'AIzaSyAlXhvKVQkKITEQs21KqBo7fgsuaaoFk-U';
const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;


const app = express();
app.use(
    cors({
        origin: 'http://localhost:3001', // Adjust to match your frontend origin
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(bodyParser.json());

const PORT = 5000;
const CLIENT_ID = '1508548'; // Replace with your Pinterest Client ID
const CLIENT_SECRET = '1e4910ff2b56f8021e4b28b392ac145975bbfc60'; // Replace with your Pinterest Client Secret
const REDIRECT_URI = 'http://localhost:5000/auth/pinterest/callback';

let stateToken = ''; // To store the state parameter

// Step 1: Redirect to Pinterest OAuth
app.get('/auth/pinterest', (req, res) => {
    // Generate a secure random state parameter
    stateToken = crypto.randomBytes(16).toString('hex');

    const scope = 'user_accounts:read,pins:read,boards:read'; // Required scopes
    const authUrl = `https://www.pinterest.com/oauth/?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&scope=${scope}&state=${stateToken}`; // Include the state parameter

    console.log(`Redirecting to Pinterest OAuth URL: ${authUrl}`);
    res.redirect(authUrl);
});

// Step 2: Handle Pinterest OAuth Callback and Exchange Code for Access Token
app.get('/auth/pinterest/callback', async (req, res) => {
    const { code, state } = req.query;

    // Validate the state parameter
    if (state !== stateToken) {
        console.error('Invalid state parameter. Possible CSRF attack.');
        return res.status(400).send('Invalid state parameter.');
    }

    if (!code) {
        console.error('Authorization code not found.');
        return res.status(400).send('Authorization code not found.');
    }

    console.log(`Received Authorization Code: ${code}`);

    const postData = new URLSearchParams();
    postData.append('grant_type', 'authorization_code');
    postData.append('redirect_uri', REDIRECT_URI);
    postData.append('code', code);

    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        console.log('Exchanging code for access token...');

        const tokenResponse = await axios.post(
            'https://api.pinterest.com/v5/oauth/token',
            postData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${authHeader}`,
                },
            }
        );

        const { access_token } = tokenResponse.data;
        console.log('Access Token:', access_token);

        // Fetch user profile using the access token
        const profileResponse = await axios.get(
            'https://api.pinterest.com/v5/user_account',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const profile = profileResponse.data;
        console.log('Logged-in User Profile:', profile);

        // Save user profile to Firestore
        const userRef = db.collection('users').doc(profile.id);
        await userRef.set(profile);

        // Fetch user pins with pagination
        let pins = [];
        let bookmark = null;  // Variable to store the bookmark for pagination

        try {
            console.log('Fetching user pins...');
            do {
                const pinsResponse = await axios.get('https://api.pinterest.com/v5/pins', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                    params: {
                        bookmark: bookmark, // Send the bookmark for pagination if it's available
                        page_size: 25,      // You can adjust this as needed (default is 25, max is 250)
                    },
                });

                const pagePins = pinsResponse.data?.items || [];
                pins = [...pins, ...pagePins]; // Add new pins to the array

                console.log('User Pins:', pagePins);
                console.log('Total Pins Retrieved:', pins.length);

                // Check if there is a bookmark for the next page (pagination)
                bookmark = pinsResponse.data?.bookmark || null;

            } while (bookmark);  // Continue fetching if there is a bookmark

            // Save pins to Firestore
            const pinsCollection = userRef.collection('pins');
            for (const pin of pins) {
                await pinsCollection.doc(pin.id).set(pin);
            }

        } catch (pinsError) {
            console.warn('No pins found or error fetching pins:', pinsError.message);
        }

        // Redirect to frontend dashboard with access token and pin details
        res.redirect(
            `http://localhost:3001/dashboard?accessToken=${encodeURIComponent(access_token)}&pinId=${encodeURIComponent(pins[0]?.id || '')}`
        );

    } catch (error) {
        console.error('Error during token exchange or profile fetch:', error.response?.data || error.message);
        res.status(500).json({
            message: 'OAuth process failed',
            error: error.response?.data || error.message,
        });
    }
});

// Step 3: Sentiment Analysis Endpoint
// Modify Sentiment Analysis Endpoint

// Sentiment Analysis Endpoint
app.post('/sentiment-analysis', async (req, res) => {
    const { pinId } = req.body;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        console.error('Missing access token');
        return res.status(401).json({ message: 'Unauthorized: No access token provided' });
    }

    if (!pinId) {
        console.error('Missing pinId');
        return res.status(400).json({ message: 'Pin ID is required for sentiment analysis.' });
    }

    try {
        // Fetch the pin details
        console.log('Fetching pin details for pinId:', pinId);
        const pinResponse = await axios.get(`https://api.pinterest.com/v5/pins/${pinId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const imageUrl = pinResponse.data.media?.images?.['600x']?.url;
        console.log('Image URL:', imageUrl);

        if (!imageUrl) {
            console.error('Image URL not found:', pinResponse.data);
            return res.status(404).json({ message: 'Image URL not found for this pin.' });
        }

        // Use Google Vision API to detect faces
        console.log('Sending image to Google Vision API...');
        const visionResponse = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                requests: [
                    {
                        image: { source: { imageUri: imageUrl } },
                        features: [{ type: 'FACE_DETECTION', maxResults: 10 }],
                    },
                ],
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const result = visionResponse.data.responses[0];
        console.log('Google Vision API Result:', result);

        if (!result.faceAnnotations || result.faceAnnotations.length === 0) {
            console.error('No face annotations found:', result);
            return res.status(404).json({ message: 'No faces detected in the image.' });
        }

        // Likelihood mapping for emotion detection
        const likelihoodMap = {
            VERY_LIKELY: 100,
            LIKELY: 75,
            POSSIBLE: 50,
            UNLIKELY: 25,
            VERY_UNLIKELY: 0,
        };

        // Parse the face data
        const analysis = result.faceAnnotations.map((face) => ({
            joy: likelihoodMap[face.joyLikelihood] || 0,
            anger: likelihoodMap[face.angerLikelihood] || 0,
            sorrow: likelihoodMap[face.sorrowLikelihood] || 0,
            surprise: likelihoodMap[face.surpriseLikelihood] || 0,
            blurred: likelihoodMap[face.blurredLikelihood] || 0,
            underExposed: likelihoodMap[face.underExposedLikelihood] || 0,
            mood: getMood(
                likelihoodMap[face.joyLikelihood],
                likelihoodMap[face.angerLikelihood],
                likelihoodMap[face.sorrowLikelihood],
                likelihoodMap[face.surpriseLikelihood]
            ),
        }));

        console.log('Sentiment Analysis Result:', analysis);
        return res.status(200).json(analysis);
    } catch (error) {
        console.error('Error performing sentiment analysis:', error.message);
        res.status(500).json({ message: 'Failed to perform sentiment analysis.', error: error.message });
    }
});

const getMood = (joy, anger, sorrow, surprise) => {
    if (joy >= 60) return 'Happy';
    if (anger >= 60) return 'Angry';
    if (sorrow >= 60) return 'Sad';
    if (surprise >= 60) return 'Surprised';
    return 'Neutral';
};

app.get('/fetch-albums', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized: No access token provided' });
    }

    try {
        let pins = [];
        let bookmark = null;

        // Step 1: Fetch Pins
        do {
            const pinsResponse = await axios.get('https://api.pinterest.com/v5/pins', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    bookmark: bookmark,
                    page_size: 25,
                },
            });

            const pagePins = pinsResponse.data?.items || [];
            pins = [...pins, ...pagePins];
            bookmark = pinsResponse.data?.bookmark || null;
        } while (bookmark);

        console.log('Total Pins Retrieved:', pins.length);

        // Step 2: Categorize Pins using Google Vision API
        const categorizedPins = {};

        for (const pin of pins) {
            if (pin.media?.images?.['600x']?.url) {
                try {
                    // Analyze the pin's image
                    const [result] = await client.labelDetection(pin.media.images['600x'].url);
                    const labels = result.labelAnnotations.map(label => label.description);

                    // Use the first label as the category
                    const primaryLabel = labels[0] || 'Uncategorized';

                    // Group pins by category
                    if (!categorizedPins[primaryLabel]) {
                        categorizedPins[primaryLabel] = [];
                    }
                    categorizedPins[primaryLabel].push(pin);
                } catch (visionError) {
                    console.error('Error analyzing pin image:', visionError.message);
                }
            }
        }

        // Step 3: Send Categorized Pins
        res.status(200).json(categorizedPins);
    } catch (error) {
        console.error('Error fetching or categorizing pins:', error.message);
        res.status(500).json({ message: 'Failed to fetch or categorize pins', error: error.message });
    }
});


// Fetch pin by ID
app.get('/fetch-pin', async (req, res) => {
    const { pinId } = req.query;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized: No access token provided' });
    }

    if (!pinId) {
        return res.status(400).json({ message: 'Pin ID is required' });
    }

    try {
        const pinResponse = await axios.get(`https://api.pinterest.com/v5/pins/${pinId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('Pinterest API Response for Pin:', pinResponse.data);

        const pin = {
            id: pinResponse.data.id,
            title: pinResponse.data.title || '',
            description: pinResponse.data.description || '',
            link: pinResponse.data.link || '',
            imageUrl: pinResponse.data.media?.images?.['600x']?.url || '',
        };

        return res.status(200).json(pin);
    } catch (error) {
        console.error('Error fetching pin from Pinterest:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch pin', error: error.response?.data || error.message });
    }
});

app.get('/fetch-pins', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized: No access token provided' });
    }

    try {
        let pins = [];
        let bookmark = null; // Variable to store the bookmark for pagination

        // Fetch user pins with pagination
        console.log('Fetching user pins...');
        do {
            const pinsResponse = await axios.get('https://api.pinterest.com/v5/pins', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    bookmark: bookmark, // Send the bookmark for pagination if it's available
                    page_size: 25,      // You can adjust this as needed (default is 25, max is 250)
                },
            });

            const pagePins = pinsResponse.data?.items || [];
            pins = [...pins, ...pagePins]; // Add new pins to the array

            console.log('User Pins:', pagePins);
            console.log('Total Pins Retrieved:', pins.length);

            // Check if there is a bookmark for the next page (pagination)
            bookmark = pinsResponse.data?.bookmark || null;

        } while (bookmark);  // Continue fetching if there is a bookmark

        // Send the retrieved pins as a response
        res.status(200).json(pins);

    } catch (error) {
        console.error('Error fetching pins:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch pins', error: error.response?.data || error.message });
    }
});


// Save analyzed data to Firestore
app.post('/save-data', async (req, res) => {
    const { userId, imageData } = req.body;

    if (!userId || !imageData) {
        return res.status(400).json({ message: 'Missing required fields: userId or imageData' });
    }

    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.collection('photos').add(imageData);

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving data to Firestore:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. Visit http://localhost:${PORT}/auth/pinterest`);
});
