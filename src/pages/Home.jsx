import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

function Home() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser()
    }, []);

    const fetchUser = async () => {

        try {

            const response = await fetch(
                `${API_URL}/api/user`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {

                navigate("/");
                return;
            }

            const data = await response.json();

            setUser(data);

        } catch (error) {

            console.error("Error fetching user:", error);

            navigate("/");

        } finally {

            setLoading(false);
        }
    };

    const handleLogout = async () => {

        try {

            const response = await fetch(
                `${API_URL}/api/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (response.ok) {

                console.log("Logout successful");

                navigate("/");

            } else {

                console.error("Logout failed");

            }

        } catch (error) {

            console.error("Logout error:", error);

        }
    };

    if (loading) {

        return (
            <div className="loading">
                Loading...
            </div>
        );
    }

    return (
        <div className="home-container">

            <nav className="navbar">

                <h2>RegLog</h2>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </nav>

            <main className="home-content">

                {user && (
                    <>
                        <h1>
                            Welcome to PharmaQuick, {user.name}! 👋
                        </h1>

                        <p>
                            You are successfully logged in.
                        </p>

                        {/* <div className="user-card">

                            <h2>Your Details</h2>

                            <p>
                                <strong>User ID:</strong>{" "}
                                {user.userId}
                            </p>

                            <p>
                                <strong>Name:</strong>{" "}
                                {user.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {user.email}
                            </p>

                            <p>
                                <strong>Mobile:</strong>{" "}
                                {user.mobile}
                            </p>

                        </div> */}
                    </>
                )}
            </main>
        </div>
    );
}

export default Home;