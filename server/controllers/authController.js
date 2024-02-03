//import { GOOGLE_CLIENT_ID } from '../../Utils/config';
// Import the the OAuth2Client from google-auth-library and creates a new instance of it.
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {createUser} = require('../model/queries');


// Create a verify function that verifies the token.
async function verify(token){
    console.log("Google Client ID (audience):", process.env.GOOGLE_CLIENT_ID); // Log the Google Client ID

    // This method is asynchronous and returns a Promise that resolves to the ticket.
    const ticket = await client.verifyIdToken({ // This method verifies the ID token and returns the decoded token payload.
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // Extract the payload from the ticket. This is ID token payload.
    const userid = payload['sub']; // It stands for Subject. It is a unique identifier for the user. It is a claim in the JWT.
    return userid; // Return the User ID. The user ID can be used to identify the user in the database.
 
}// End of the verify function

// Export the loginWithGoogle function
exports.loginWithGoogle = async (req, res) => {

    const {token} = req.body; // Get the token from the request body of the HTTP POST request.
    
    try {
        // if the token is valid, we can send the user data to frontend. 
        //And the user can be created in the database and the user login was successful.
        console.log('Verifying token:', token);
        const userid = await verify(token);
        console.log('Verified user id:', userid);
        
        // Create a new user in the database if the user doesn't exist.
        console.log('Creating user for id:', userid);
        const user = await createUser(userid);
        console.log('Created user:', user);

        res.status(200).send({user});
    } catch(e) {
        // if there's an error, we'll send the error in the response
        console.error(e); // Log the error for debugging
        res.status(500).send({ error: 'Internal Server Error' });
    } // End of the try-catch block

}; 