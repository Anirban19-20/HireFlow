import axios from "axios";

const axiosInstance =
    axios.create({
        baseURL:
            process.env.REACT_APP_API_BASE_URL
    });


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