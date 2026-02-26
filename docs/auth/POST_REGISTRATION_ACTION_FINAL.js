// Auth0 Action: Sync to FABT Database

/**
 * Handler that will be called after a new user has registered.
 *
 * @param {Event} event - Details about the registration event.
 * @param {PostUserRegistrationAPI} api - Interface for interacting with the post-registration process.
 */
exports.onExecutePostUserRegistration = async (event, api) => {
    const axios = require("axios");

    const syncEndpoint = "https://fabt.vercel.app/api/auth/sync";
    const syncSecret = event.secrets.SYNC_SECRET;

    const { user } = event;

    const payload = {
        auth0Id: user.user_id,
        email: user.email,
        role: user.user_metadata?.role || "BAND",
    };

    try {
        await axios.post(syncEndpoint, payload, {
            headers: {
                "Authorization": `Bearer ${syncSecret}`,
                "Content-Type": "application/json",
            },
            timeout: 5000, // Add a timeout for robustness
        });
        console.log("Successfully synced user to local DB.");
    } catch (error) {
        console.error("Failed to sync user:", error.message);
    }
};
