import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
    getProducts,
    searchProducts,
    getProductsByCategory
} from "../services/productService";

import heroImage from "../assets/heroimg3.png";
import "../css/HomePage.css";


const API_URL = import.meta.env.VITE_API_URL;

function Home() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Products");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getProducts();

            const data =
                response?.data ??
                response ??
                [];

            setProducts(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error("Failed to load products:", err);
            setError("Unable to load products.");

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async (e) => {

        e.preventDefault();

        const value = search.trim();

        if (!value) {
            loadProducts();
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await searchProducts(value);

            const data =
                response?.data ??
                response ??
                [];

            setProducts(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error("Search error:", err);
            setError("Unable to search products.");

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    const handleCategory = async (category) => {

        setSelectedCategory(category);

        try {

            setLoading(true);
            setError("");

            if (category === "All Products") {

                await loadProducts();
                return;

            }

            const response =
                await getProductsByCategory(category);

            const data =
                response?.data ??
                response ??
                [];

            setProducts(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error("Category error:", err);

            setError(
                "Unable to load category products."
            );

        } finally {

            setLoading(false);

        }
    };


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

        } catch (err) {

            console.error("Logout error:", err);

        } finally {

            navigate("/");

        }
    };


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    const formatPrice = (price) => {

        if (price === null || price === undefined) {
            return "₹0.00";
        }

        return `₹${Number(price).toFixed(2)}`;
    };


    // =====================================================
    // GET SELLING PRICE
    // =====================================================

    const getSellingPrice = (product) => {

        if (
            product.discountPrice !== null &&
            product.discountPrice !== undefined &&
            Number(product.discountPrice) < Number(product.price)
        ) {
            return product.discountPrice;
        }

        return product.price;
    };


    // =====================================================
    // CATEGORY DATA
    // =====================================================

    const categories = [
        {
            name: "All Products",
            icon: "▦"
        },
        {
            name: "Tablets",
            icon: "💊"
        },
        {
            name: "Syrups",
            icon: "🧴"
        },
        {
            name: "Injections",
            icon: "💉"
        },
        {
            name: "Healthcare",
            icon: "🩺"
        }
    ];


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="home-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="home-navbar">

                <div className="navbar-container">

                    {/* BRAND */}

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


                    {/* SEARCH */}

                    <form
                        className="navbar-search"
                        onSubmit={handleSearch}
                    >

                        <span className="search-icon">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search medicines, healthcare products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <button type="submit">
                            Search
                        </button>

                    </form>


                    {/* NAVIGATION */}

                    <nav className="navbar-links">

                        <button
                            onClick={() =>
                                navigate("/home")
                            }
                            className="nav-link active"
                        >
                            Home
                        </button>

                        <button
                            onClick={() =>
                                navigate("/products")
                            }
                            className="nav-link"
                        >
                            Products
                        </button>

                        <button
                            onClick={() =>
                                navigate("/cart")
                            }
                            className="nav-cart"
                        >
                            🛒
                            <span>Cart</span>
                        </button>

                        <button onClick={() => navigate("/orders")}>
                            My Orders
                        </button>

                        <button
                            onClick={handleLogout}
                            className="logout-button"
                        >
                            Logout
                        </button>

                    </nav>

                </div>

            </header >


            {/* =================================================
                TRUST BAR
            ================================================= */}

            < section className="trust-bar" >

                <div className="trust-container">

                    <div className="trust-item">

                        <span className="trust-icon">
                            ✓
                        </span>

                        <div>
                            <strong>
                                Genuine Products
                            </strong>

                            <small>
                                Quality you can trust
                            </small>
                        </div>

                    </div>


                    <div className="trust-item">

                        <span className="trust-icon">
                            🚚
                        </span>

                        <div>
                            <strong>
                                Fast Delivery
                            </strong>

                            <small>
                                Delivered to your doorstep
                            </small>
                        </div>

                    </div>


                    <div className="trust-item">

                        <span className="trust-icon">
                            🔒
                        </span>

                        <div>
                            <strong>
                                Secure Payments
                            </strong>

                            <small>
                                100% secure checkout
                            </small>
                        </div>

                    </div>


                    <div className="trust-item">

                        <span className="trust-icon">
                            💚
                        </span>

                        <div>
                            <strong>
                                Trusted Healthcare
                            </strong>

                            <small>
                                Your health matters
                            </small>
                        </div>

                    </div>

                </div>

            </section >


            <main>

                {/* =================================================
                    HERO SECTION
                ================================================= */}

                <section className="hero-section">

                    <div className="hero-container">

                        <div className="hero-content">

                            <div className="hero-badge">
                                💚 Trusted Healthcare Store
                            </div>

                            <h1>
                                Your Health,
                                <br />
                                <span>Delivered.</span>
                            </h1>

                            <p>
                                Genuine medicines and healthcare
                                products delivered right to your
                                doorstep.
                            </p>


                            <div className="hero-buttons">

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate("/products")
                                    }
                                >
                                    Shop Medicines
                                    <span>→</span>
                                </button>


                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        handleCategory("All Products")
                                    }
                                >
                                    Explore Products
                                </button>

                            </div>

                        </div>


                        {/* HERO IMAGE */}

                        <div className="hero-image-container">

                            <div className="hero-circle"></div>

                            <img
                                src={heroImage}
                                alt="PharmaQuick healthcare"
                                className="hero-image"
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CATEGORIES
                ================================================= */}

                <section className="category-section">

                    <div className="section-container">

                        <div className="section-heading">

                            <div>

                                <span className="section-label">
                                    EXPLORE
                                </span>

                                <h2>
                                    Shop by Category
                                </h2>

                                <p>
                                    Find the healthcare products
                                    you need.
                                </p>

                            </div>

                        </div>


                        <div className="category-grid">

                            {categories.map((category) => (

                                <button
                                    key={category.name}
                                    className={
                                        selectedCategory === category.name
                                            ? "category-card selected"
                                            : "category-card"
                                    }
                                    onClick={() =>
                                        handleCategory(category.name)
                                    }
                                >

                                    <span className="category-icon">
                                        {category.icon}
                                    </span>

                                    <span className="category-name">
                                        {category.name}
                                    </span>

                                    <span className="category-arrow">
                                        →
                                    </span>

                                </button>

                            ))}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <section className="products-section">

                    <div className="section-container">

                        <div className="products-heading">

                            <div>

                                <span className="section-label">
                                    OUR STORE
                                </span>

                                <h2>
                                    Popular Products
                                </h2>

                            </div>


                            <button
                                className="view-all-button"
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                View All →
                            </button>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* LOADING */}

                        {loading && (

                            <div className="loading-container">

                                <div className="loader"></div>

                                <p>
                                    Loading products...
                                </p>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            products.length === 0 && (

                                <div className="empty-products">

                                    <div className="empty-icon">
                                        💊
                                    </div>

                                    <h3>
                                        No products found
                                    </h3>

                                    <p>
                                        Try another category or search.
                                    </p>

                                </div>

                            )}


                        {/* PRODUCT GRID */}

                        {!loading &&
                            products.length > 0 && (

                                <div className="product-grid">

                                    {products
                                        .slice(0, 8)
                                        .map((product) => {

                                            const sellingPrice =
                                                getSellingPrice(product);

                                            const hasDiscount =
                                                product.discountPrice !== null &&
                                                product.discountPrice !== undefined &&
                                                Number(product.discountPrice) <
                                                Number(product.price);

                                            return (

                                                <article
                                                    className="product-card"
                                                    key={product.productId}
                                                >

                                                    {/* IMAGE */}

                                                    <div className="product-image-wrapper">

                                                        {hasDiscount && (

                                                            <span className="discount-badge">
                                                                SALE
                                                            </span>

                                                        )}


                                                        {product.imageUrl ? (

                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="product-image"
                                                            />

                                                        ) : (

                                                            <div className="product-placeholder">
                                                                💊
                                                            </div>

                                                        )}

                                                    </div>


                                                    {/* PRODUCT INFO */}

                                                    <div className="product-info">

                                                        <span className="product-category">
                                                            {product.category}
                                                        </span>

                                                        <h3>
                                                            {product.name}
                                                        </h3>

                                                        <p className="product-brand">
                                                            {product.brand}
                                                        </p>


                                                        <div className="product-bottom">

                                                            <div className="price-container">

                                                                <strong>
                                                                    {formatPrice(
                                                                        sellingPrice
                                                                    )}
                                                                </strong>

                                                                {hasDiscount && (

                                                                    <del>
                                                                        {formatPrice(
                                                                            product.price
                                                                        )}
                                                                    </del>

                                                                )}

                                                            </div>


                                                            <button
                                                                className="product-view-button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/products/${product.productId}`
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>

                                                        </div>

                                                    </div>

                                                </article>

                                            );

                                        })}

                                </div>

                            )}

                    </div>

                </section>


                {/* =================================================
                    HEALTH BANNER
                ================================================= */}

                <section className="health-banner">

                    <div className="health-banner-container">

                        <div className="health-icon">
                            ❤️
                        </div>

                        <div>

                            <h2>
                                Your health is our priority.
                            </h2>

                            <p>
                                Shop trusted healthcare products
                                from PharmaQuick.
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            Shop Now →
                        </button>

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="home-footer">

                <div className="footer-container">

                    <div className="footer-brand">

                        <div className="footer-logo">
                            💊 PharmaQuick
                        </div>

                        <p>
                            Your Health, Delivered.
                        </p>

                    </div>


                    <div className="footer-links">

                        <button
                            onClick={() =>
                                navigate("/home")
                            }
                        >
                            Home
                        </button>

                        <button
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            Products
                        </button>

                        <button
                            onClick={() =>
                                navigate("/cart")
                            }
                        >
                            Cart
                        </button>

                    </div>

                </div>


                <div className="footer-bottom">
                    © 2026 PharmaQuick. All rights reserved.
                </div>

            </footer>

        </div >

    );
}

export default Home;