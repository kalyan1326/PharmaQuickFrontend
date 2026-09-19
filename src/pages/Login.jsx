import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(data || "Login failed");
            }

            console.log("Login successful");

            // JWT cookie is automatically stored by browser
            navigate("/home");

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Login</h1>

                <p className="subtitle">
                    Login to your account
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>User ID</label>

                        <input
                            type="text"
                            placeholder="Enter your user ID"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="switch-page">
                    Don't have an account?

                    <Link to="/signup">
                        Sign Up
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;