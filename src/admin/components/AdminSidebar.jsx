
import React from "react";
import { NavLink } from "react-router-dom";
import "../css/AdminSidebar.css";

function AdminSidebar() {

    return (
        <aside className="admin-sidebar">

            <div className="admin-sidebar-brand">
                <span className="admin-brand-icon">💊</span>

                <div>
                    <h2>PharmaQuick</h2>
                    <p>Admin Panel</p>
                </div>
            </div>

            <nav className="admin-sidebar-nav">

                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                        isActive ? "admin-nav-link active" : "admin-nav-link"
                    }
                >
                    <span>▦</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                        isActive ? "admin-nav-link active" : "admin-nav-link"
                    }
                >
                    <span>▣</span>
                    Products
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                        isActive ? "admin-nav-link active" : "admin-nav-link"
                    }
                >
                    <span>▤</span>
                    Orders
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                        isActive ? "admin-nav-link active" : "admin-nav-link"
                    }
                >
                    <span>♙</span>
                    Users
                </NavLink>

            </nav>

            <div className="admin-sidebar-footer">
                <p>PharmaQuick</p>
                <span>Administration</span>
            </div>

        </aside>
    );
}

export default AdminSidebar;
