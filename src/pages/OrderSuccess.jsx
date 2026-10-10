import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/OrderSuccess.css";

const API_URL = import.meta.env.VITE_API_URL;

function OrderSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/orders/${orderId}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to load order"
                    );
                }

                console.log("Order details:", data);

                setOrder(data);

            } catch (err) {
                console.error("Order loading error:", err);

                setError(
                    err.message || "Unable to load order details"
                );
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    // -----------------------------------------
    // Loading
    // -----------------------------------------

    if (loading) {
        return (
            <div className="order-success-page">
                <div className="order-success-loading">
                    Loading order details...
                </div>
            </div>
        );
    }

    // -----------------------------------------
    // Error
    // -----------------------------------------

    if (error || !order) {
        return (
            <div className="order-success-page">
                <div className="order-success-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load order
                    </h2>

                    <p>
                        {error || "Order details could not be found."}
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
    // Helper values
    // -----------------------------------------

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    const shippingAddress = order.shippingAddress || {};

    // -----------------------------------------
    // JSX
    // -----------------------------------------

    return (
        <div className="order-success-page">

            <div className="order-success-container">

                {/* Success Header */}

                <div className="success-header">

                    <div className="success-icon">
                        ✓
                    </div>

                    <h1>
                        Payment Successful!
                    </h1>

                    <p>
                        Thank you for your order. Your payment has
                        been successfully verified.
                    </p>

                </div>

                {/* Order Information */}

                <div className="order-info-card">

                    <div className="order-info-row">

                        <div>
                            <span>
                                Order ID
                            </span>

                            <strong>
                                #{order.orderId}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Order Status
                            </span>

                            <strong className="status-success">
                                {order.status}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Payment Status
                            </span>

                            <strong className="status-success">
                                {order.paymentStatus}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* Ordered Products */}

                <div className="order-card">

                    <h2>
                        Ordered Products
                    </h2>

                    <div className="order-items">

                        {items.length === 0 ? (
                            <p className="no-items">
                                No items found.
                            </p>
                        ) : (
                            items.map((item, index) => {

                                const itemName =
                                    item.productName ||
                                    item.name ||
                                    "Product";

                                const price =
                                    Number(item.price || 0);

                                const quantity =
                                    Number(item.quantity || 1);

                                const subtotal =
                                    Number(
                                        item.subtotal ??
                                        price * quantity
                                    );

                                return (
                                    <div
                                        className="order-item"
                                        key={
                                            item.orderItemId ??
                                            index
                                        }
                                    >

                                        <div className="order-item-details">

                                            <h3>
                                                {itemName}
                                            </h3>

                                            <p>
                                                Quantity: {quantity}
                                            </p>

                                        </div>

                                        <div className="order-item-price">

                                            ₹{subtotal.toFixed(2)}

                                        </div>

                                    </div>
                                );
                            })
                        )}

                    </div>

                    <div className="order-total">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </strong>

                    </div>

                </div>

                {/* Shipping Address */}

                <div className="order-card">

                    <h2>
                        Delivery Address
                    </h2>

                    <div className="shipping-address">

                        <strong>
                            {shippingAddress.fullName}
                        </strong>

                        <p>
                            {shippingAddress.mobile}
                        </p>

                        <p>
                            {shippingAddress.addressLine}
                        </p>

                        <p>
                            {shippingAddress.city},{" "}
                            {shippingAddress.state} -{" "}
                            {shippingAddress.pincode}
                        </p>

                    </div>

                </div>

                {/* Buttons */}

                <div className="order-actions">

                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>

                    <button
                        className="home-btn"
                        onClick={() => navigate("/home")}
                    >
                        Go to Home
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrderSuccess;