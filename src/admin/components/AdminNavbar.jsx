
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminNavbar.css";

function AdminNavbar() {

    const navigate = useNavigate();

    const handleLogout = async () => {

        try {

            await fetch(
                `${import.meta.env.VITE_API_URL}/api/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            navigate("/admin/login", { replace: true });
        }
    };

    return (
        <header className="admin-navbar">

            <div>
                <h2>Admin Dashboard</h2>
                <p>Manage your pharmacy store</p>
            </div>

            <div className="admin-navbar-actions">

                <div className="admin-profile">
                    <div className="admin-avatar">A</div>

                    <div className="admin-profile-info">
                        <strong>Administrator</strong>
                        <span>Admin</span>
                    </div>
                </div>

                <button
                    className="admin-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </header>
    );
}

export default AdminNavbar;
