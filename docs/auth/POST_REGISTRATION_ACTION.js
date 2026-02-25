// docs/auth/POST_REGISTRATION_ACTION.js

/**
 * Handler that will be called after a new user has registered.
 *
 * @param {Event} event - Details about the registration event.
 * @param {PostUserRegistrationAPI} api - Interface for interacting with the post-registration process.
 */
exports.onExecutePostUserRegistration = async (event, api) => {
  const axios = require("axios");

  const syncEndpoint = "https://YOUR_DOMAIN.com/api/auth/sync"; // Replace with your actual endpoint
  const syncSecret = event.secrets.SYNC_SECRET; // Set this in your Auth0 secrets

  const { user } = event;

  // 1. Prepare data for our local DB
  // For Zero-Knowledge: We ONLY send the auth0Id and email to our local sync endpoint.
  // We can pass user_metadata if the user chose a role during signup.
  const payload = {
    auth0Id: user.user_id,
    email: user.email,
    role: user.user_metadata?.role || "BAND", // Default to BAND if not specified
  };

  try {
    await axios.post(syncEndpoint, payload, {
      headers: {
        "Authorization": `Bearer ${syncSecret}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Successfully synced user to local DB.");
  } catch (error) {
    console.error("Failed to sync user:", error.message);
  }

  // 2. Logic to strip/minimize PII in Auth0 (Optional - check Auth0 Management API limits)
  // For Zero-Knowledge, you might want to nullify fields you don't need in Auth0.
};
