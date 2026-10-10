
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {

    const navigate = useNavigate();

    const [productCount, setProductCount] = useState(null);
    const [lowStockCount, setLowStockCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [totalOrders, setTotalOrders] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    useEffect(() => {
        let active = true;

        const loadOrderStatistics = async () => {
            try {
                setOrdersLoading(true);
                setOrdersError("");

                const response = await fetch(
                    `${API_URL}/api/admin/orders`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load order statistics (${response.status}).`
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Unexpected orders response from the server.");
                }

                // Count every order.
                const orderCount = data.length;

                // Count revenue from paid orders only.
                // Refunded orders are not counted as revenue.
                const revenue = data
                    .filter((order) => order.paymentStatus === "PAID")
                    .reduce(
                        (sum, order) => sum + Number(order.totalAmount ?? 0),
                        0
                    );

                // Sort by creation date and keep the latest five.
                const latestOrders = [...data]
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5);

                if (active) {
                    setTotalOrders(orderCount);
                    setTotalRevenue(revenue);
                    setRecentOrders(latestOrders);
                }
            } catch (err) {
                if (active) {
                    setOrdersError(
                        err.message || "Unable to load order statistics."
                    );
                }
            } finally {
                if (active) {
                    setOrdersLoading(false);
                }
            }
        };

        loadOrderStatistics();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {

        let active = true;

        const loadDashboard = async () => {

            try {

                const response = await fetch(
                    `${API_URL}/api/products`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load product statistics.");
                }

                const data = await response.json();

                const products = Array.isArray(data)
                    ? data
                    : Array.isArray(data.content)
                        ? data.content
                        : Array.isArray(data.products)
                            ? data.products
                            : [];

                const lowStock = products.filter(
                    (product) =>
                        Number(product.stock ?? 0) <= 10
                ).length;

                if (active) {
                    setProductCount(products.length);
                    setLowStockCount(lowStock);
                }

            } catch (err) {

                if (active) {
                    setError(err.message);
                }

            } finally {

                if (active) {
                    setLoading(false);
                }

            }
        };

        loadDashboard();

        return () => {
            active = false;
        };

    }, []);

    const stats = [
        {
            title: "Total Products",
            value: productCount,
            icon: "📦",
            description: "Products in your catalog",
            color: "blue",
        },
        {
            title: "Low Stock Products",
            value: lowStockCount,
            icon: "⚠️",
            description: "Products with stock of 10 or less",
            color: "orange",
        },
        {
            title: "Total Orders",
            value: totalOrders,
            icon: "🛍️",
            description: "All customer orders",
            color: "purple",
        },
        {
            title: "Total Revenue",
            value: totalRevenue,
            icon: "₹",
            description: "Revenue from paid orders",
            color: "green",
        },
    ];

    return (

        <div className="admin-dashboard">

            {/* Welcome section */}

            <section className="dashboard-welcome">

                <div>
                    <span className="dashboard-eyebrow">
                        OVERVIEW
                    </span>

                    <h1>Welcome to PharmaQuick</h1>

                    <p>
                        Manage your pharmacy store from one place.
                    </p>
                </div>

                <button
                    className="dashboard-primary-btn"
                    onClick={() => navigate("/admin/products")}
                >
                    + Manage Products
                </button>

            </section>

            {/* Error message */}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* Statistics */}

            <section className="dashboard-stats">

                {stats.map((stat) => (

                    <article
                        className="dashboard-stat-card"
                        key={stat.title}
                    >

                        <div className="dashboard-stat-top">

                            <div>
                                <p className="dashboard-stat-title">
                                    {stat.title}
                                </p>

                                <h2>
                                    {(stat.title === "Total Products" ||
                                        stat.title === "Low Stock Products"
                                        ? loading
                                        : ordersLoading) && stat.value === null
                                        ? "..."
                                        : stat.value === null
                                            ? "—"
                                            : stat.title === "Total Revenue"
                                                ? new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                    maximumFractionDigits: 2,
                                                }).format(stat.value)
                                                : stat.value}
                                </h2>
                            </div>

                            <div className={`dashboard-stat-icon ${stat.color}`}>
                                {stat.icon}
                            </div>

                        </div>

                        <p className="dashboard-stat-description">
                            {stat.description}
                        </p>

                    </article>

                ))}

            </section>

            {/* Main dashboard content */}

            <section className="dashboard-main-grid">

                <article className="dashboard-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Common administration tasks</p>
                        </div>
                    </div>

                    <div className="dashboard-quick-actions">

                        <button
                            className="dashboard-action"
                            onClick={() => navigate("/admin/products")}
                        >
                            <span className="dashboard-action-icon">
                                📦
                            </span>

                            <span>
                                <strong>Manage Products</strong>
                                <small>Add, edit and remove medicines</small>
                            </span>

                            <span className="dashboard-action-arrow">→</span>
                        </button>

                        <button
                            className="dashboard-action"
                            onClick={() => navigate("/admin/orders")}
                        >
                            <span className="dashboard-action-icon">
                                🛒
                            </span>

                            <span>
                                <strong>Manage Orders</strong>
                                <small>Review customer orders</small>
                            </span>

                            <span className="dashboard-action-arrow">→</span>
                        </button>

                        <button
                            className="dashboard-action"
                            onClick={() => navigate("/admin/users")}
                        >
                            <span className="dashboard-action-icon">
                                👥
                            </span>

                            <span>
                                <strong>Manage Users</strong>
                                <small>View registered customers</small>
                            </span>

                            <span className="dashboard-action-arrow">→</span>
                        </button>

                    </div>

                </article>

                <article className="dashboard-panel stock-panel">

                    <div className="dashboard-panel-header">
                        <div>
                            <h2>Inventory Overview</h2>
                            <p>Product stock health</p>
                        </div>

                        <span className="inventory-icon">📊</span>
                    </div>

                    {loading ? (

                        <p className="dashboard-empty">
                            Loading inventory...
                        </p>

                    ) : error ? (

                        <p className="dashboard-empty">
                            Inventory data could not be loaded.
                        </p>

                    ) : (

                        <>
                            <div className="inventory-number">
                                {productCount}
                            </div>

                            <p className="inventory-caption">
                                Total products in catalog
                            </p>

                            <div className="inventory-divider" />

                            <div className="inventory-stock-row">
                                <span>Low stock products</span>

                                <strong className={
                                    lowStockCount > 0
                                        ? "stock-warning"
                                        : "stock-healthy"
                                }>
                                    {lowStockCount}
                                </strong>
                            </div>

                            <button
                                className="dashboard-secondary-btn"
                                onClick={() => navigate("/admin/products")}
                            >
                                View Inventory
                            </button>
                        </>

                    )}

                </article>

            </section>

            {/* Recent activity placeholder */}

            <section className="dashboard-panel dashboard-bottom-panel">

                <div className="dashboard-panel-header">
                    <div>
                        <h2>Recent Activity</h2>
                        <p>Latest store updates</p>
                    </div>
                </div>


                {ordersLoading ? (
                    <p className="dashboard-empty">Loading recent orders...</p>
                ) : ordersError ? (
                    <p className="dashboard-empty">
                        Recent orders could not be loaded: {ordersError}
                    </p>
                ) : recentOrders.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="dashboard-empty-icon">📋</div>
                        <h3>No orders yet</h3>
                        <p>Customer orders will appear here when they are placed.</p>
                    </div>
                ) : (
                    <div className="dashboard-recent-orders">
                        {recentOrders.map((order) => (
                            <div className="dashboard-recent-order" key={order.orderId}>
                                <div className="dashboard-recent-order-icon">🛍️</div>

                                <div className="dashboard-recent-order-info">
                                    <strong>Order #{order.orderId}</strong>
                                    <span>
                                        {order.shippingAddress?.fullName || "Customer"}
                                    </span>
                                    <small>
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleString("en-IN")
                                            : "Date unavailable"}
                                    </small>
                                </div>

                                <div className="dashboard-recent-order-meta">
                                    <strong>
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            maximumFractionDigits: 2,
                                        }).format(Number(order.totalAmount ?? 0))}
                                    </strong>

                                    <span className="dashboard-recent-order-status">
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <button
                            className="dashboard-secondary-btn"
                            onClick={() => navigate("/admin/orders")}
                        >
                            View All Orders
                        </button>
                    </div>
                )}


            </section>

        </div>
    );
}

export default AdminDashboard;
