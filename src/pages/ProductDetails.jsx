import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    getProductById
} from "../services/productService";
import "../css/ProductDetails.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {

    const navigate = useNavigate();
    const { productId } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState("");

    useEffect(() => {
        loadProduct();
    }, [productId]);

    // =====================================================
    // LOAD PRODUCT
    // =====================================================

    const loadProduct = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getProductById(productId);

            setProduct(data);

        } catch (error) {

            console.error("Product loading error:", error);

            setError(
                error.message || "Unable to load product."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // INCREASE QUANTITY
    // =====================================================

    const increaseQuantity = () => {

        if (product && quantity < product.stock) {

            setQuantity(previous => previous + 1);

        }
    };


    // =====================================================
    // DECREASE QUANTITY
    // =====================================================

    const decreaseQuantity = () => {

        if (quantity > 1) {

            setQuantity(previous => previous - 1);

        }
    };


    // =====================================================
    // ADD TO CART
    // =====================================================

    const handleAddToCart = async () => {

        if (!product) {
            return;
        }

        if (product.stock <= 0) {

            setCartMessage("This product is currently out of stock.");

            return;
        }

        try {

            setCartLoading(true);
            setCartMessage("");

            const response = await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        productId: product.productId,
                        quantity: quantity
                    })
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText || "Failed to add product to cart."
                );

            }

            setCartMessage("Product added to cart successfully.");

        } catch (error) {

            console.error("Add to cart error:", error);

            setCartMessage(
                error.message ||
                "Unable to add product to cart."
            );

        } finally {

            setCartLoading(false);

        }
    };


    // =====================================================
    // BUY NOW
    // =====================================================

    const handleBuyNow = async () => {

        if (!product) {
            return;
        }

        if (product.stock <= 0) {

            setCartMessage("This product is currently out of stock.");

            return;
        }

        try {

            setCartLoading(true);
            setCartMessage("");

            const response = await fetch(
                `${API_URL}/api/cart`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        productId: product.productId,
                        quantity: quantity
                    })
                }
            );

            const responseText = await response.text();

            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Failed to add product to cart."
                );

            }

            navigate("/cart");

        } catch (error) {

            console.error("Buy now error:", error);

            setCartMessage(
                error.message ||
                "Unable to continue."
            );

        } finally {

            setCartLoading(false);

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="product-details-page">

                <div className="details-loading">

                    <div className="details-spinner"></div>

                    <p>
                        Loading product...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !product) {

        return (
            <div className="product-details-page">

                <nav className="details-navbar">

                    <div
                        className="details-logo"
                        onClick={() => navigate("/home")}
                    >
                        💊 <strong>PharmaQuick</strong>
                    </div>

                </nav>

                <div className="details-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Product Not Found
                    </h2>

                    <p>
                        {error || "Unable to find this product."}
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Back to Products
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // PRICE
    // =====================================================

    const hasDiscount =
        product.discountPrice &&
        product.discountPrice < product.price;

    const finalPrice =
        hasDiscount
            ? product.discountPrice
            : product.price;

    const discountPercentage =
        hasDiscount
            ? Math.round(
                ((product.price - product.discountPrice) /
                    product.price) *
                100
            )
            : 0;


    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="product-details-page">

            {/* ================= NAVBAR ================= */}

            <nav className="details-navbar">

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


                <div className="details-nav-links">

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
                        🛒 Cart
                    </button>

                </div>

            </nav>


            {/* ================= BREADCRUMB ================= */}

            <div className="details-breadcrumb-container">

                <div className="details-breadcrumb">

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>

                    <span> / </span>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Products
                    </button>

                    <span> / </span>

                    <span>
                        {product.name}
                    </span>

                </div>

            </div>


            {/* ================= PRODUCT DETAILS ================= */}

            <main className="product-details-container">

                <div className="product-details-card">


                    {/* ================= IMAGE ================= */}

                    <div className="details-image-section">

                        <div className="details-image-container">

                            {product.imageUrl ? (

                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="details-product-image"
                                />

                            ) : (

                                <div className="details-no-image">
                                    💊
                                </div>

                            )}

                            {hasDiscount && (

                                <span className="details-discount-badge">
                                    {discountPercentage}% OFF
                                </span>

                            )}

                        </div>

                    </div>


                    {/* ================= PRODUCT INFO ================= */}

                    <div className="details-info">

                        <span className="details-category">
                            {product.category}
                        </span>


                        <h1>
                            {product.name}
                        </h1>


                        <p className="details-brand">
                            Brand: <strong>{product.brand}</strong>
                        </p>


                        <div className="details-rating">

                            <span className="stars">
                                ★★★★★
                            </span>

                            <span>
                                Trusted Healthcare Product
                            </span>

                        </div>


                        <div className="details-divider"></div>


                        {/* ================= PRICE ================= */}

                        <div className="details-price-section">

                            <span className="details-current-price">
                                ₹{finalPrice}
                            </span>

                            {hasDiscount && (

                                <span className="details-old-price">
                                    ₹{product.price}
                                </span>

                            )}

                        </div>


                        {hasDiscount && (

                            <p className="details-saving">
                                You save ₹
                                {(product.price -
                                    product.discountPrice).toFixed(2)}
                            </p>

                        )}


                        {/* ================= DESCRIPTION ================= */}

                        <div className="details-description">

                            <h3>
                                Description
                            </h3>

                            <p>
                                {product.description ||
                                    "No description available for this product."}
                            </p>

                        </div>


                        {/* ================= STOCK ================= */}

                        <div className="details-stock">

                            {product.stock > 0 ? (

                                <>
                                    <span className="stock-check">
                                        ✓
                                    </span>

                                    <span>
                                        In Stock
                                    </span>

                                    <small>
                                        {product.stock} units available
                                    </small>
                                </>

                            ) : (

                                <span className="details-out-stock">
                                    Out of Stock
                                </span>

                            )}

                        </div>


                        {/* ================= QUANTITY ================= */}

                        {product.stock > 0 && (

                            <div className="quantity-section">

                                <span>
                                    Quantity
                                </span>

                                <div className="quantity-control">

                                    <button
                                        onClick={decreaseQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>

                                    <span>
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={increaseQuantity}
                                        disabled={
                                            quantity >= product.stock
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        )}


                        {/* ================= ACTION BUTTONS ================= */}

                        {product.stock > 0 && (

                            <div className="details-actions">

                                <button
                                    className="add-cart-button"
                                    onClick={handleAddToCart}
                                    disabled={cartLoading}
                                >

                                    {cartLoading
                                        ? "Adding..."
                                        : "🛒 Add to Cart"}

                                </button>


                                <button
                                    className="buy-now-button"
                                    onClick={handleBuyNow}
                                    disabled={cartLoading}
                                >

                                    Buy Now

                                </button>

                            </div>

                        )}


                        {/* ================= CART MESSAGE ================= */}

                        {cartMessage && (

                            <div
                                className={
                                    cartMessage.includes("successfully")
                                        ? "cart-success-message"
                                        : "cart-error-message"
                                }
                            >
                                {cartMessage}
                            </div>

                        )}


                        {/* ================= TRUST FEATURES ================= */}

                        <div className="details-trust">

                            <div>
                                <span>🚚</span>

                                <div>
                                    <strong>
                                        Fast Delivery
                                    </strong>

                                    <small>
                                        Quick doorstep delivery
                                    </small>
                                </div>
                            </div>


                            <div>
                                <span>🔒</span>

                                <div>
                                    <strong>
                                        Secure Payment
                                    </strong>

                                    <small>
                                        Safe & secure checkout
                                    </small>
                                </div>
                            </div>


                            <div>
                                <span>✓</span>

                                <div>
                                    <strong>
                                        Genuine Products
                                    </strong>

                                    <small>
                                        Quality healthcare products
                                    </small>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="details-footer">

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

            </footer>

        </div>
    );
}

export default ProductDetails;