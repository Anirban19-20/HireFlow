// =====================================================
// AUTH STORAGE KEYS
// =====================================================

const TOKEN_KEY = "token";
const USER_KEY = "user";
const AUTH_MESSAGE_KEY = "authMessage";


// =====================================================
// GET TOKEN
// =====================================================

export const getToken = () => {

    return localStorage.getItem(
        TOKEN_KEY
    );
};


// =====================================================
// DECODE JWT PAYLOAD
// =====================================================

export const decodeJwtPayload = (
    token
) => {

    try {

        if (!token) {
            return null;
        }

        const parts =
            token.split(".");

        if (parts.length !== 3) {
            return null;
        }

        let base64Url =
            parts[1];

        let base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        // Add padding if required
        while (
            base64.length % 4 !== 0
        ) {

            base64 += "=";
        }

        const decoded =
            atob(base64);

        const jsonPayload =
            decodeURIComponent(
                decoded
                    .split("")
                    .map(
                        (character) => {

                            return (
                                "%" +
                                (
                                    "00" +
                                    character
                                        .charCodeAt(0)
                                        .toString(16)
                                ).slice(-2)
                            );
                        }
                    )
                    .join("")
            );

        return JSON.parse(
            jsonPayload
        );

    } catch (error) {

        console.error(
            "Unable to decode JWT:",
            error
        );

        return null;
    }
};


// =====================================================
// CHECK TOKEN EXPIRY
// =====================================================

export const isTokenExpired = (
    token
) => {

    if (!token) {
        return true;
    }

    const payload =
        decodeJwtPayload(
            token
        );

    if (!payload) {

        // Invalid JWT should not be trusted
        return true;
    }

    if (!payload.exp) {

        // JWT without expiry information
        return true;
    }

    // JWT exp is measured in seconds
    const expiryTime =
        payload.exp * 1000;

    return Date.now() >=
        expiryTime;
};


// =====================================================
// CLEAR AUTHENTICATION
// =====================================================

export const clearAuthentication = (
    message = null
) => {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );

    if (message) {

        sessionStorage.setItem(
            AUTH_MESSAGE_KEY,
            message
        );
    }
};


// =====================================================
// GET AUTH MESSAGE
// =====================================================

export const getAuthMessage = () => {

    return sessionStorage.getItem(
        AUTH_MESSAGE_KEY
    );
};


// =====================================================
// CLEAR AUTH MESSAGE
// =====================================================

export const clearAuthMessage = () => {

    sessionStorage.removeItem(
        AUTH_MESSAGE_KEY
    );
};