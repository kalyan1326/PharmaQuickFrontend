import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
    getProducts,
    searchProducts,
    getProductsByCategory
} from "../services/productService";

import "../css/AllProducts.css";

function Products() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Products");

    const categories = [
        "All Products",
        "Tablets",
        "Syrups",
        "Injections",
        "Capsules",
        "Healthcare",
        "Personal Care"
    ];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getProducts();

            setProducts(data || []);

        } catch (error) {

            console.error("Error loading products:", error);

            setError("Unable to load products.");

        } finally {

            setLoading(false);

        }
    };

    const handleSearch = async (e) => {

        const value = e.target.value;

        setSearchTerm(value);

        if (!value.trim()) {
            loadProducts();
            return;
        }

        try {

            setLoading(true);
            setError("");

            const data = await searchProducts(value);

            setProducts(data || []);

        } catch (error) {

            console.error("Search error:", error);

            setError("Unable to search products.");

        } finally {

            setLoading(false);

        }
    };

    const handleCategory = async (category) => {

        setSelectedCategory(category);

        try {

            setLoading(true);
            setError("");

            if (category === "All Products") {

                const data = await getProducts();

                setProducts(data || []);

            } else {

                const data = await getProductsByCategory(category);

                setProducts(data || []);

            }

        } catch (error) {

            console.error("Category error:", error);

            setError("Unable to load products.");

        } finally {

            setLoading(false);

        }
    };

    const handleLogout = async () => {

        const API_URL = import.meta.env.VITE_API_URL;

        try {

            await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                credentials: "include"
            });

        } catch (error) {

            console.error("Logout error:", error);

        } finally {

            navigate("/");
        }
    };

    const handleViewProduct = (productId) => {

        navigate(`/products/${productId}`);

    };

    return (
        <div className="products-page">

            {/* ================= NAVBAR ================= */}

            <nav className="products-navbar">

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

                <div className="products-search">

                    <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />

                    <span>🔍</span>

                </div>

                <div className="products-nav-links">

                    <button
                        onClick={() => navigate("/home")}
                    >
                        Home
                    </button>

                    <button
                        className="active"
                        onClick={() => navigate("/products")}
                    >
                        Products
                    </button>

                    <button
                        onClick={() => navigate("/cart")}
                    >
                        🛒 Cart
                    </button>

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= PAGE HEADER ================= */}

            <section className="products-header">

                <div>

                    <p className="products-breadcrumb">
                        Home / Products
                    </p>

                    <h1>
                        Medicines & Healthcare Products
                    </h1>

                    <p>
                        Browse our wide range of medicines and healthcare products.
                    </p>

                </div>

            </section>


            {/* ================= CATEGORY FILTER ================= */}

            <section className="category-section">

                <div className="category-buttons">

                    {categories.map((category) => (

                        <button
                            key={category}
                            className={
                                selectedCategory === category
                                    ? "category-button active"
                                    : "category-button"
                            }
                            onClick={() => handleCategory(category)}
                        >
                            {category}
                        </button>

                    ))}

                </div>

            </section>


            {/* ================= PRODUCTS ================= */}

            <main className="products-container">

                <div className="products-top">

                    <h2>
                        {selectedCategory === "All Products"
                            ? "All Products"
                            : selectedCategory}
                    </h2>

                    <span>
                        {products.length} products
                    </span>

                </div>


                {loading && (

                    <div className="products-message">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>

                )}


                {!loading && error && (

                    <div className="products-message error">

                        <p>{error}</p>

                        <button onClick={loadProducts}>
                            Try Again
                        </button>

                    </div>

                )}


                {!loading && !error && products.length === 0 && (

                    <div className="products-message">

                        <div className="empty-icon">
                            🔍
                        </div>

                        <h3>No products found</h3>

                        <p>
                            Try another search or category.
                        </p>

                    </div>

                )}


                {!loading && !error && products.length > 0 && (

                    <div className="products-grid">

                        {products.map((product) => (

                            <div
                                className="product-card"
                                key={product.productId}
                            >

                                <div className="product-image-container">

                                    {product.imageUrl ? (

                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="product-image"
                                        />

                                    ) : (

                                        <div className="no-product-image">
                                            💊
                                        </div>

                                    )}

                                    {product.discountPrice &&
                                        product.discountPrice < product.price && (

                                            <span className="discount-badge">
                                                {Math.round(
                                                    ((product.price -
                                                        product.discountPrice) /
                                                        product.price) *
                                                    100
                                                )}
                                                % OFF
                                            </span>

                                        )}

                                </div>


                                <div className="product-content">

                                    <span className="product-category">
                                        {product.category}
                                    </span>

                                    <h3>
                                        {product.name}
                                    </h3>

                                    <p className="product-brand">
                                        {product.brand}
                                    </p>


                                    <div className="product-price">

                                        {product.discountPrice &&
                                            product.discountPrice < product.price ? (

                                            <>
                                                <span className="current-price">
                                                    ₹{product.discountPrice}
                                                </span>

                                                <span className="old-price">
                                                    ₹{product.price}
                                                </span>
                                            </>

                                        ) : (

                                            <span className="current-price">
                                                ₹{product.price}
                                            </span>

                                        )}

                                    </div>


                                    <div className="product-stock">

                                        {product.stock > 0 ? (

                                            <span className="in-stock">
                                                ✓ In Stock
                                            </span>

                                        ) : (

                                            <span className="out-stock">
                                                Out of Stock
                                            </span>

                                        )}

                                    </div>


                                    <button
                                        className="view-product-button"
                                        onClick={() =>
                                            handleViewProduct(
                                                product.productId
                                            )
                                        }
                                    >
                                        View Product
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="products-footer">

                <div className="footer-content">

                    <div className="footer-brand">

                        <h3>
                            💊 PharmaQuick
                        </h3>

                        <p>
                            Your trusted online pharmacy for
                            medicines and healthcare products.
                        </p>

                    </div>


                    <div className="footer-links">

                        <h4>Quick Links</h4>

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


                    <div className="footer-help">

                        <h4>Need Help?</h4>

                        <p>
                            📞 +91 98765 43210
                        </p>

                        <p>
                            ✉️ support@pharmaquick.com
                        </p>

                    </div>

                </div>


                <div className="footer-bottom">

                    © 2026 PharmaQuick. All rights reserved.

                </div>

            </footer>

        </div>
    );
}

export default Products;