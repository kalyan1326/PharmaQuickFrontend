
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminProducts.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProducts() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [stockFilter, setStockFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const loadProducts = useCallback(async () => {

        setLoading(true);
        setError("");

        try {

            const response = await fetch(
                `${API_URL}/api/products`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load products.");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Unexpected product response format.");
            }

            setProducts(data);

        } catch (err) {

            setError(err.message || "Something went wrong.");

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(
                products
                    .map((product) => product.category?.trim())
                    .filter(Boolean)
            )
        ];

    }, [products]);

    const filteredProducts = useMemo(() => {

        const term = search.trim().toLowerCase();

        return products.filter((product) => {

            const matchesSearch =
                product.name?.toLowerCase().includes(term) ||
                product.brand?.toLowerCase().includes(term) ||
                product.category?.toLowerCase().includes(term);

            const matchesCategory =
                category === "All" ||
                product.category?.toLowerCase() === category.toLowerCase();

            const stock = Number(product.stock ?? 0);

            const matchesStock =
                stockFilter === "All" ||
                (stockFilter === "Low Stock" && stock > 0 && stock <= 10) ||
                (stockFilter === "Out of Stock" && stock <= 0) ||
                (stockFilter === "In Stock" && stock > 10);

            return matchesSearch && matchesCategory && matchesStock;

        });

    }, [products, search, category, stockFilter]);

    const handleDelete = async (product) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) return;

        setDeletingId(product.productId);
        setError("");
        setNotice("");

        try {

            const response = await fetch(
                `${API_URL}/api/products/${product.productId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if (!response.ok) {

                const responseText = await response.text();

                let message = responseText;

                try {
                    const parsed = JSON.parse(responseText);
                    message = parsed.message || responseText;
                } catch {
                    // The backend may return plain text.
                }

                throw new Error(
                    message || "Unable to delete product."
                );
            }

            setProducts((previous) =>
                previous.filter(
                    (item) => item.productId !== product.productId
                )
            );

            setNotice(`${product.name} was deleted successfully.`);

        } catch (err) {

            setError(err.message || "Unable to delete product.");

        } finally {

            setDeletingId(null);

        }

    };

    const formatPrice = (price) => {

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(price ?? 0));

    };

    const getStockStatus = (stockValue) => {

        const stock = Number(stockValue ?? 0);

        if (stock <= 0) {
            return { label: "Out of stock", className: "out-stock" };
        }

        if (stock <= 10) {
            return { label: "Low stock", className: "low-stock" };
        }

        return { label: "In stock", className: "in-stock" };

    };

    return (

        <div className="admin-products-page">

            <div className="admin-products-header">

                <div>
                    <span className="products-eyebrow">
                        INVENTORY MANAGEMENT
                    </span>

                    <h1>Products</h1>

                    <p>
                        Manage your medicines, prices and stock.
                    </p>
                </div>

                <button
                    className="products-add-btn"
                    onClick={() => navigate("/admin/products/new")}
                >
                    <span>＋</span> Add Product
                </button>

            </div>

            <div className="products-summary">

                <div className="products-summary-card">
                    <span>Total Products</span>
                    <strong>{loading ? "..." : products.length}</strong>
                </div>

                <div className="products-summary-card">
                    <span>In Stock</span>
                    <strong>
                        {loading
                            ? "..."
                            : products.filter(
                                (product) => Number(product.stock) > 10
                            ).length}
                    </strong>
                </div>

                <div className="products-summary-card">
                    <span>Low Stock</span>
                    <strong>
                        {loading
                            ? "..."
                            : products.filter(
                                (product) =>
                                    Number(product.stock) > 0 &&
                                    Number(product.stock) <= 10
                            ).length}
                    </strong>
                </div>

                <div className="products-summary-card">
                    <span>Out of Stock</span>
                    <strong>
                        {loading
                            ? "..."
                            : products.filter(
                                (product) => Number(product.stock) <= 0
                            ).length}
                    </strong>
                </div>

            </div>

            {error && (
                <div className="products-alert products-alert-error">
                    <span>{error}</span>

                    <button onClick={loadProducts}>
                        Retry
                    </button>
                </div>
            )}

            {notice && (
                <div className="products-alert products-alert-success">
                    {notice}
                </div>
            )}

            <section className="products-table-panel">

                <div className="products-toolbar">

                    <div className="products-search">
                        <span>⌕</span>

                        <input
                            type="search"
                            placeholder="Search name, brand or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search products"
                        />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Filter by category"
                    >
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item === "All" ? "All Categories" : item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        aria-label="Filter by stock status"
                    >
                        <option value="All">All Stock Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>

                    <button
                        className="products-refresh-btn"
                        onClick={loadProducts}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>

                <div className="products-table-heading">

                    <div>
                        <h2>Product Inventory</h2>
                        <p>
                            {loading
                                ? "Loading products..."
                                : `${filteredProducts.length} of ${products.length} products`}
                        </p>
                    </div>

                </div>

                {loading ? (

                    <div className="products-state">
                        <div className="products-spinner" />
                        <p>Loading product inventory...</p>
                    </div>

                ) : !error && filteredProducts.length === 0 ? (

                    <div className="products-state">
                        <div className="products-empty-icon">📦</div>
                        <h3>No products found</h3>
                        <p>
                            Try another search or change the filters.
                        </p>
                    </div>

                ) : !error ? (

                    <div className="products-table-scroll">

                        <table className="admin-products-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Discount Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.map((product) => {

                                    const stockStatus = getStockStatus(
                                        product.stock
                                    );

                                    return (

                                        <tr key={product.productId}>

                                            <td>
                                                <div className="product-cell">

                                                    {product.imageUrl ? (

                                                        <img
                                                            className="product-thumbnail"
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                                e.currentTarget.nextElementSibling.style.display = "grid";
                                                            }}
                                                        />

                                                    ) : null}

                                                    <div
                                                        className="product-thumbnail-placeholder"
                                                        style={{
                                                            display: product.imageUrl
                                                                ? "none"
                                                                : "grid"
                                                        }}
                                                    >
                                                        💊
                                                    </div>

                                                    <div className="product-cell-info">
                                                        <strong>{product.name}</strong>
                                                        <span>
                                                            ID: {product.productId}
                                                        </span>
                                                        <small>
                                                            {product.brand || "No brand"}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <span className="product-category">
                                                    {product.category || "Uncategorized"}
                                                </span>
                                            </td>

                                            <td>
                                                {formatPrice(product.price)}
                                            </td>

                                            <td className="product-discount-price">
                                                {product.discountPrice != null
                                                    ? formatPrice(product.discountPrice)
                                                    : "—"}
                                            </td>

                                            <td>
                                                <strong>
                                                    {product.stock ?? 0}
                                                </strong>
                                                <span className="product-stock-unit">
                                                    {" "}units
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`product-stock-badge ${stockStatus.className}`}
                                                >
                                                    {stockStatus.label}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="product-row-actions">

                                                    <button
                                                        className="product-edit-btn"
                                                        title="Edit product"
                                                        aria-label={`Edit ${product.name}`}
                                                        onClick={() => navigate(
                                                            `/admin/products/edit/${product.productId}`
                                                        )}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="product-delete-btn"
                                                        title="Delete product"
                                                        aria-label={`Delete ${product.name}`}
                                                        disabled={
                                                            deletingId === product.productId
                                                        }
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        {deletingId === product.productId
                                                            ? "..."
                                                            : "Delete"}
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                ) : null}

            </section>

        </div>

    );

}

export default AdminProducts;
