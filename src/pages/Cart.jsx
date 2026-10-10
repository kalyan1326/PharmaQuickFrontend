import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "../css/Cart.css";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {

    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingProductId, setUpdatingProductId] = useState(null);
    const [removingProductId, setRemovingProductId] = useState(null);

    // =====================================================
    // LOAD CART
    // =====================================================

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText || "Failed to load cart."
                );
            }

            const data = responseText
                ? JSON.parse(responseText)
                : [];

            /*
             * Your backend may return either:
             *
             * [
             *   {...},
             *   {...}
             * ]
             *
             * or:
             *
             * {
             *   items: [...]
             * }
             */

            if (Array.isArray(data)) {

                setCartItems(data);

            } else if (data.items && Array.isArray(data.items)) {

                setCartItems(data.items);

            } else {

                setCartItems([]);

            }

        } catch (error) {

            console.error("Cart loading error:", error);

            setError(
                error.message ||
                "Unable to load your cart."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // GET PRODUCT ID
    // =====================================================

    const getProductId = (item) => {

        return (
            item.productId ||
            item.product?.productId ||
            item.product?.id
        );

    };


    // =====================================================
    // GET PRODUCT NAME
    // =====================================================

    const getProductName = (item) => {

        return (
            item.productName ||
            item.product?.name ||
            "Product"
        );

    };


    // =====================================================
    // GET PRODUCT IMAGE
    // =====================================================

    const getProductImage = (item) => {

        return (
            item.imageUrl ||
            item.product?.imageUrl ||
            null
        );

    };


    // =====================================================
    // GET PRICE
    // =====================================================

    const getItemPrice = (item) => {

        return Number(
            item.price ||
            item.product?.discountPrice ||
            item.product?.price ||
            0
        );

    };


    // =====================================================
    // GET QUANTITY
    // =====================================================

    const getQuantity = (item) => {

        return Number(item.quantity || 1);

    };


    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    const updateQuantity = async (item, newQuantity) => {

        const productId = getProductId(item);

        if (!productId) {
            return;
        }

        if (newQuantity < 1) {
            return;
        }

        try {

            setUpdatingProductId(productId);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart/${productId}?quantity=${newQuantity}`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Failed to update cart."
                );
            }

            await loadCart();

        } catch (error) {

            console.error(
                "Update cart error:",
                error
            );

            setError(
                error.message ||
                "Unable to update cart."
            );

        } finally {

            setUpdatingProductId(null);

        }
    };


    // =====================================================
    // REMOVE ITEM
    // =====================================================

    const removeItem = async (productId) => {

        if (!productId) {
            return;
        }

        try {

            setRemovingProductId(productId);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Failed to remove item."
                );
            }

            await loadCart();

        } catch (error) {

            console.error(
                "Remove item error:",
                error
            );

            setError(
                error.message ||
                "Unable to remove item."
            );

        } finally {

            setRemovingProductId(null);

        }
    };


    // =====================================================
    // CLEAR CART
    // =====================================================

    const clearCart = async () => {

        if (cartItems.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Failed to clear cart."
                );
            }

            setCartItems([]);

        } catch (error) {

            console.error(
                "Clear cart error:",
                error
            );

            setError(
                error.message ||
                "Unable to clear cart."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    const subtotal = cartItems.reduce(
        (total, item) => {

            const price = getItemPrice(item);
            const quantity = getQuantity(item);

            return total + price * quantity;

        },
        0
    );

    const deliveryCharge =
        subtotal > 0 && subtotal < 500
            ? 40
            : 0;

    const totalAmount =
        subtotal + deliveryCharge;


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {

        try {

            await fetch(
                `${API_URL}/api/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            navigate("/");
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="cart-page">

                <nav className="cart-navbar">

                    <div
                        className="cart-logo"
                        onClick={() => navigate("/home")}
                    >
                        💊 <strong>PharmaQuick</strong>
                    </div>

                </nav>

                <div className="cart-loading">

                    <div className="cart-spinner"></div>

                    <p>
                        Loading your cart...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="cart-page">

            {/* ================= NAVBAR ================= */}

            <nav className="cart-navbar">

                <div
                        className="navbar-brand"
                        onClick={() => navigate("/home")}
                    >

                        <Link to="/" className="navbar-brand">
                            <img
                                src="/pharmacyAppIcon2.png"
                                alt="PharmaQuick"
                                className="navbar-logo"
                            />

                            <div className="brand-text">

                                <span className="brand-name">
                                    Pharma<span>Quick</span>
                                </span>

                                <span className="brand-tagline">
                                    Your Health, Delivered.
                                </span>

                            </div>
                        </Link>

                    </div>


                <div className="cart-nav-links">

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Products
                    </button>

                    <button className="active">
                        🛒 Cart
                    </button>

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= HEADER ================= */}

            <section className="cart-header">

                <div>

                    <p className="cart-breadcrumb">
                        Home / Cart
                    </p>

                    <h1>
                        Your Shopping Cart
                    </h1>

                    <p>
                        Review your medicines and healthcare products
                        before checkout.
                    </p>

                </div>

            </section>


            {/* ================= CART ================= */}

            <main className="cart-container">

                {error && (

                    <div className="cart-error">

                        <span>⚠️</span>

                        <p>
                            {error}
                        </p>

                        <button onClick={loadCart}>
                            Try Again
                        </button>

                    </div>

                )}


                {cartItems.length === 0 ? (

                    /* ================= EMPTY CART ================= */

                    <div className="empty-cart">

                        <div className="empty-cart-icon">
                            🛒
                        </div>

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Looks like you haven't added
                            anything to your cart yet.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="shop-products-button"
                        >
                            Browse Products
                        </button>

                    </div>

                ) : (

                    <div className="cart-layout">


                        {/* ================= CART ITEMS ================= */}

                        <section className="cart-items-section">

                            <div className="cart-items-header">

                                <h2>
                                    Cart Items
                                </h2>

                                <button
                                    onClick={clearCart}
                                    className="clear-cart-button"
                                >
                                    Clear Cart
                                </button>

                            </div>


                            <div className="cart-items">

                                {cartItems.map((item) => {

                                    const productId =
                                        getProductId(item);

                                    const productName =
                                        getProductName(item);

                                    const productImage =
                                        getProductImage(item);

                                    const price =
                                        getItemPrice(item);

                                    const quantity =
                                        getQuantity(item);

                                    const itemTotal =
                                        price * quantity;

                                    const updating =
                                        updatingProductId ===
                                        productId;

                                    const removing =
                                        removingProductId ===
                                        productId;

                                    return (

                                        <div
                                            className="cart-item"
                                            key={productId}
                                        >

                                            {/* IMAGE */}

                                            <div className="cart-item-image">

                                                {productImage ? (

                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                    />

                                                ) : (

                                                    <div>
                                                        💊
                                                    </div>

                                                )}

                                            </div>


                                            {/* INFO */}

                                            <div className="cart-item-info">

                                                <h3>
                                                    {productName}
                                                </h3>

                                                {item.product?.brand && (

                                                    <p>
                                                        {item.product.brand}
                                                    </p>

                                                )}

                                                <span className="cart-item-price">
                                                    ₹{price.toFixed(2)}
                                                </span>

                                            </div>


                                            {/* QUANTITY */}

                                            <div className="cart-item-quantity">

                                                <span>
                                                    Quantity
                                                </span>

                                                <div className="quantity-control">

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                quantity - 1
                                                            )
                                                        }
                                                        disabled={
                                                            updating ||
                                                            quantity <= 1
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    <strong>
                                                        {quantity}
                                                    </strong>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                quantity + 1
                                                            )
                                                        }
                                                        disabled={updating}
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>


                                            {/* TOTAL */}

                                            <div className="cart-item-total">

                                                <strong>
                                                    ₹{itemTotal.toFixed(2)}
                                                </strong>

                                            </div>


                                            {/* REMOVE */}

                                            <button
                                                className="remove-item-button"
                                                onClick={() =>
                                                    removeItem(productId)
                                                }
                                                disabled={
                                                    removing ||
                                                    updating
                                                }
                                            >
                                                {removing
                                                    ? "..."
                                                    : "✕"}
                                            </button>

                                        </div>

                                    );
                                })}

                            </div>

                        </section>


                        {/* ================= ORDER SUMMARY ================= */}

                        <aside className="order-summary">

                            <h2>
                                Order Summary
                            </h2>


                            <div className="summary-row">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹{subtotal.toFixed(2)}
                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Delivery
                                </span>

                                <strong>

                                    {deliveryCharge === 0
                                        ? "FREE"
                                        : `₹${deliveryCharge.toFixed(2)}`}

                                </strong>

                            </div>


                            <div className="free-delivery-note">

                                {subtotal >= 500 ? (
                                    "🎉 You qualify for free delivery!"
                                ) : (
                                    "Add ₹" +
                                    Math.max(
                                        0,
                                        500 - subtotal
                                    ).toFixed(2) +
                                    " more for free delivery."
                                )}

                            </div>


                            <div className="summary-divider"></div>


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹{totalAmount.toFixed(2)}
                                </strong>

                            </div>


                            <button
                                className="checkout-button"
                                onClick={() =>
                                    navigate("/checkout")
                                }
                            >
                                Proceed to Checkout
                            </button>


                            <button
                                className="continue-shopping-button"
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                ← Continue Shopping
                            </button>


                            <div className="checkout-security">

                                <span>🔒</span>

                                <div>

                                    <strong>
                                        Secure Checkout
                                    </strong>

                                    <small>
                                        Your payment information
                                        is protected.
                                    </small>

                                </div>

                            </div>

                        </aside>

                    </div>

                )}

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="cart-footer">

                <div className="cart-footer-content">

                    <div>

                        <h3>
                            💊 PharmaQuick
                        </h3>

                        <p>
                            Your trusted online pharmacy for
                            medicines and healthcare products.
                        </p>

                    </div>


                    <div>

                        <h4>
                            Quick Links
                        </h4>

                        <button
                            onClick={() => navigate("/home")}
                        >
                            Home
                        </button>

                        <button
                            onClick={() => navigate("/products")}
                        >
                            Products
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                        >
                            Cart
                        </button>

                    </div>

                </div>


                <div className="cart-footer-bottom">

                    © 2026 PharmaQuick. All rights reserved.

                </div>

            </footer>

        </div>
    );
}

export default Cart;