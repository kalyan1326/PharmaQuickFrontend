import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
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

        if (!formData.userId || !formData.password) {

            setError("Please enter User ID and password.");

            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        username:formData.userId,
                        password:formData.password
                    })
                }
            );

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = {
                    message: responseText
                };
            }

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Admin login failed."
                );
            }

            navigate("/admin/dashboard");

        } catch (error) {

            setError(
                error.message ||
                "Unable to login as admin."
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-header">

                    <div className="admin-login-icon">
                        💊
                    </div>

                    <h1>
                        PharmaQuick
                    </h1>

                    <p>
                        Admin Portal
                    </p>

                </div>

                {error && (
                    <div className="admin-login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="admin-form-group">

                        <label htmlFor="userId">
                            Admin User ID
                        </label>

                        <input
                            id="userId"
                            type="text"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            placeholder="Enter admin User ID"
                            autoComplete="username"
                        />

                    </div>

                    <div className="admin-form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter admin password"
                            autoComplete="current-password"
                        />

                    </div>

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Admin Sign In"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;