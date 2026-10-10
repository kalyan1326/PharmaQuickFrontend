import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!formData.username || !formData.password) {
            setError("Please enter your User ID and password.");
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(formData)
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Invalid User ID or password."
                );
            }

            navigate("/home");

        } catch (error) {

            setError(
                error.message ||
                "Unable to login. Please try again."
            );

        } finally {

            setLoading(false);
        }




    };

    return (

        <div className="auth-page">

            {/* Brand */}

            <div className="auth-brand">

                <div className="brand-icon">
                    💊
                </div>

                <div>
                    <h1>PharmaQuick</h1>

                    <p>
                        Your Health, Delivered.
                    </p>
                </div>

            </div>


            {/* Login Card */}

            <div className="auth-card">

                <div className="auth-header">

                    <h2>
                        Welcome Back
                    </h2>

                    <p>
                        Sign in to continue to PharmaQuick
                    </p>

                </div>


                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                <form onSubmit={handleSubmit}>

                    {/* User ID */}

                    <div className="form-group">

                        <label htmlFor="username">
                            User ID
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your User ID"
                            autoComplete="username"
                        />

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />

                    </div>


                    {/* Login Button */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign In"
                        }

                    </button>

                </form>


                {/* Register Link */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/signup">
                        Create Account
                    </Link>

                </div>

            </div>


            {/* Footer */}

            <p className="auth-copyright">
                © {new Date().getFullYear()} PharmaQuick.
                All rights reserved.
            </p>

        </div>
    );
}

export default Login;