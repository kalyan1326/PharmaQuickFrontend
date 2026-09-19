import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        password: "",
        confirmPassword: "",
        email: "",
        mobile: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        // Check passwords
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        userId: formData.userId,
                        name: formData.name,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                        email: formData.email,
                        mobile: formData.mobile
                    })
                }
            );

            const data = await response.text();

            console.log("Signup status:", response.status);
            console.log("Signup response:", data);

            if (!response.ok) {
                throw new Error(data || "Signup failed");
            }

            setSuccess("User registered successfully!");

            setFormData({
                userId: "",
                name: "",
                password: "",
                confirmPassword: "",
                email: "",
                mobile: ""
            });

            // Go to login after 1 second
            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {

            console.error("Signup error:", error);

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card signup-card">

                <h1>Create Account</h1>

                <p className="subtitle">
                    Register a new account
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSignup}>

                    <div className="form-group">
                        <label>User ID</label>

                        <input
                            type="text"
                            name="userId"
                            placeholder="Enter user ID"
                            value={formData.userId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile</label>

                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Enter mobile number"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </button>

                </form>

                <p className="switch-page">
                    Already have an account?

                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Signup;