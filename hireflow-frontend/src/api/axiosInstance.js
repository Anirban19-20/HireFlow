import axios from "axios";


// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL =
    process.env.REACT_APP_API_URL?.trim() ||
    (
        window.location.hostname === "localhost"
            ? "http://localhost:8080"
            : "https://hireflow-backend-fvwp.onrender.com"
    );


// =====================================================
// AXIOS INSTANCE
// =====================================================

const axiosInstance =
    axios.create({

        baseURL:
            API_BASE_URL,

        headers: {
            "Content-Type":
                "application/json"
        }
    });


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

axiosInstance.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                "token"
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {

        return Promise.reject(
            error
        );
    }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

axiosInstance.interceptors.response.use(

    (response) =>
        response,

    (error) => {

        if (
            error.response?.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "userId"
            );

            window.location.href =
                "/login";
        }

        return Promise.reject(
            error
        );
    }
);


export default axiosInstance;