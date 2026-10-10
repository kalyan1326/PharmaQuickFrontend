import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Orders.css";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // -----------------------------------------
    // Fetch Orders
    // -----------------------------------------

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/orders`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to load orders"
                    );
                }

                console.log("My orders:", data);

                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    setOrders([]);
                }

            } catch (err) {
                console.error("Orders loading error:", err);

                setError(
                    err.message || "Unable to load your orders"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // -----------------------------------------
    // Loading
    // -----------------------------------------

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    Loading your orders...
                </div>
            </div>
        );
    }

    // -----------------------------------------
    // Error
    // -----------------------------------------

    if (error) {
        return (
            
            <div className="orders-page">
                

                <div className="orders-error">

                    <div className="orders-error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load orders
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Go to Home
                    </button>

                </div>

            </div>
        );
    }

    // -----------------------------------------
    // Empty Orders
    // -----------------------------------------

    if (orders.length === 0) {
        return (
            <div className="orders-page">

                <div className="orders-empty">

                    <div className="empty-orders-icon">
                        📦
                    </div>

                    <h1>
                        No Orders Yet
                    </h1>

                    <p>
                        You haven't placed any orders yet.
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Start Shopping
                    </button>

                </div>

            </div>
        );
    }

    // -----------------------------------------
    // Format Date
    // -----------------------------------------

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // -----------------------------------------
    // Status Class
    // -----------------------------------------

    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return status.toLowerCase();
    };

    // -----------------------------------------
    // JSX
    // -----------------------------------------

    return (
        <div className="orders-page">

            <div className="orders-container">

                {/* Header */}

                <div className="orders-header">

                    <div>
                        <h1>
                            My Orders
                        </h1>

                        <p>
                            View and track all your orders.
                        </p>
                    </div>

                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>

                </div>

                {/* Orders */}

                <div className="orders-list">

                    {orders.map((order) => (

                        <div
                            className="order-list-card"
                            key={order.orderId}
                        >

                            {/* Order Header */}

                            <div className="order-list-header">

                                <div>

                                    <span className="order-label">
                                        Order ID
                                    </span>

                                    <strong>
                                        #{order.orderId}
                                    </strong>

                                </div>

                                <div>

                                    <span className="order-label">
                                        Order Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            order.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>

                            {/* Order Status */}

                            <div className="order-status-section">

                                <div>

                                    <span>
                                        Order Status
                                    </span>

                                    <strong
                                        className={`order-status ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Payment
                                    </span>

                                    <strong
                                        className={`payment-status ${getStatusClass(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        {order.paymentStatus}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Total
                                    </span>

                                    <strong className="order-amount">
                                        ₹
                                        {Number(
                                            order.totalAmount || 0
                                        ).toFixed(2)}
                                    </strong>

                                </div>

                            </div>

                            {/* Products */}

                            <div className="order-products">

                                <h3>
                                    Products
                                </h3>

                                {Array.isArray(order.items) &&
                                order.items.length > 0 ? (

                                    order.items.map(
                                        (item, index) => {

                                            const itemName =
                                                item.productName ||
                                                item.name ||
                                                "Product";

                                            const quantity =
                                                Number(
                                                    item.quantity || 1
                                                );

                                            const subtotal =
                                                Number(
                                                    item.subtotal || 0
                                                );

                                            return (
                                                <div
                                                    className="order-product"
                                                    key={
                                                        item.orderItemId ??
                                                        index
                                                    }
                                                >

                                                    <div>
                                                        <strong>
                                                            {itemName}
                                                        </strong>

                                                        <span>
                                                            Qty:{" "}
                                                            {quantity}
                                                        </span>
                                                    </div>

                                                    <span className="product-price">
                                                        ₹
                                                        {subtotal.toFixed(
                                                            2
                                                        )}
                                                    </span>

                                                </div>
                                            );
                                        }
                                    )

                                ) : (

                                    <p className="no-products">
                                        No products found.
                                    </p>

                                )}

                            </div>

                            {/* Delivery Address */}

                            {order.shippingAddress && (

                                <div className="order-address">

                                    <h3>
                                        Delivery Address
                                    </h3>

                                    <p>
                                        <strong>
                                            {
                                                order
                                                    .shippingAddress
                                                    .fullName
                                            }
                                        </strong>
                                    </p>

                                    <p>
                                        {
                                            order
                                                .shippingAddress
                                                .addressLine
                                        }
                                    </p>

                                    <p>
                                        {
                                            order
                                                .shippingAddress
                                                .city
                                        }
                                        ,{" "}
                                        {
                                            order
                                                .shippingAddress
                                                .state
                                        }{" "}
                                        -{" "}
                                        {
                                            order
                                                .shippingAddress
                                                .pincode
                                        }
                                    </p>

                                </div>

                            )}

                            {/* Footer */}

                            <div className="order-list-footer">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.orderId}`
                                        )
                                    }
                                >
                                    View Order Details
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}

export default Orders;