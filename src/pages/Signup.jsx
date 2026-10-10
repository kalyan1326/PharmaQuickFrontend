import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");


        // -------------------------------------------------
        // Frontend validation
        // -------------------------------------------------

        if (
            !formData.userId ||
            !formData.name ||
            !formData.email ||
            !formData.mobile ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            setError(
                "Please fill in all the fields."
            );

            return;
        }


        if (formData.password !== formData.confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (!/^[6-9][0-9]{9}$/.test(formData.mobile)) {

            setError(
                "Please enter a valid 10-digit mobile number."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/signup`,
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
                    "Registration failed."
                );
            }

            setSuccess(
                "Account created successfully!"
            );

            setTimeout(() => {

                navigate("/login");

            }, 1200);

        } catch (error) {

            setError(
                error.message ||
                "Unable to create account."
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
                    <img
                                src="/pharmacyAppIcon2.png"
                                alt="PharmaQuick"
                                className="navbar-logo"
                    />
                </div>

                <div>

                    <h1>
                        PharmaQuick
                    </h1>

                    <p>
                        Your Health, Delivered.
                    </p>

                </div>

            </div>


            {/* Signup Card */}

            <div className="auth-card signup-card">

                <div className="auth-header">

                    <h2>
                        Create Account
                    </h2>

                    <p>
                        Join PharmaQuick today
                    </p>

                </div>


                {/* Error */}

                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                {/* Success */}

                {success && (

                    <div className="auth-success">
                        {success}
                    </div>

                )}


                <form onSubmit={handleSubmit}>

                    {/* User ID */}

                    <div className="form-group">

                        <label htmlFor="userId">
                            User ID
                        </label>

                        <input
                            id="userId"
                            type="text"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            placeholder="Choose a User ID"
                            autoComplete="username"
                        />

                    </div>


                    {/* Name */}

                    <div className="form-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            autoComplete="name"
                        />

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                    </div>


                    {/* Mobile */}

                    <div className="form-group">

                        <label htmlFor="mobile">
                            Mobile Number
                        </label>

                        <input
                            id="mobile"
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            maxLength="10"
                            autoComplete="tel"
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
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />

                    </div>


                    {/* Confirm Password */}

                    <div className="form-group">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                        />

                    </div>


                    {/* Submit */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Create Account"
                        }

                    </button>

                </form>


                {/* Login Link */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign In
                    </Link>

                </div>

            </div>


            {/* Copyright */}

            <p className="auth-copyright">

                © {new Date().getFullYear()} PharmaQuick.
                All rights reserved.

            </p>

        </div>
    );
}

export default Signup;