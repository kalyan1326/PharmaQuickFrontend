
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/AdminAddProduct.css";
import "../css/AdminEditProduct.css";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function AdminEditProduct() {

    const { productId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        brand: "",
        price: "",
        discountPrice: "",
        stock: ""
    });

    const [existingImage, setExistingImage] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {

        let active = true;

        const loadProduct = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/products/${productId}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                const responseText = await response.text();

                let data = {};

                try {
                    data = responseText ? JSON.parse(responseText) : {};
                } catch {
                    data = { message: responseText };
                }

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load product details."
                    );
                }

                if (!active) return;

                setFormData({
                    name: data.name ?? "",
                    description: data.description ?? "",
                    category: data.category ?? "",
                    brand: data.brand ?? "",
                    price: data.price ?? "",
                    discountPrice: data.discountPrice ?? "",
                    stock: data.stock ?? ""
                });

                setExistingImage(data.imageUrl ?? "");

            } catch (err) {

                if (active) {
                    setError(
                        err.message || "Unable to load product details."
                    );
                }

            } finally {

                if (active) {
                    setLoading(false);
                }

            }
        };

        loadProduct();

        return () => {
            active = false;
        };

    }, [productId]);

    useEffect(() => {

        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };

    }, [imagePreview]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    const handleImageChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        setError("");
        setSuccess("");

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG and WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError("Image size must not exceed 5 MB.");
            e.target.value = "";
            return;
        }

        setImage(file);
        setImagePreview(URL.createObjectURL(file));

    };

    const removeSelectedImage = () => {

        setImage(null);
        setImagePreview("");

        const input = document.getElementById("edit-product-image");

        if (input) {
            input.value = "";
        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.name.trim() ||
            !formData.description.trim() ||
            !formData.category.trim() ||
            !formData.brand.trim() ||
            formData.price === "" ||
            formData.stock === ""
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        const price = Number(formData.price);

        const discountPrice =
            formData.discountPrice === ""
                ? null
                : Number(formData.discountPrice);

        const stock = Number(formData.stock);

        if (!Number.isFinite(price) || price <= 0) {
            setError("Price must be greater than zero.");
            return;
        }

        if (
            discountPrice !== null &&
            (
                !Number.isFinite(discountPrice) ||
                discountPrice < 0 ||
                discountPrice > price
            )
        ) {
            setError(
                "Discount price must be zero or greater and cannot exceed the original price."
            );
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            setError("Stock must be a non-negative whole number.");
            return;
        }

        try {

            setSaving(true);

            const body = new FormData();

            body.append("name", formData.name.trim());
            body.append("description", formData.description.trim());
            body.append("category", formData.category.trim());
            body.append("brand", formData.brand.trim());
            body.append("price", String(price));
            body.append(
                "discountPrice",
                discountPrice === null ? "" : String(discountPrice)
            );
            body.append("stock", String(stock));

            if (image) {
                body.append("image", image);
            }

            const response = await fetch(
                `${API_URL}/api/products/${productId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    body
                }
            );

            const responseText = await response.text();

            let data = {};

            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch {
                data = { message: responseText };
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    responseText ||
                    "Unable to update product."
                );
            }

            setSuccess("Product updated successfully!");

            setTimeout(() => {
                navigate("/admin/products", {
                    state: {
                        message: "Product updated successfully!"
                    }
                });
            }, 800);

        } catch (err) {

            setError(
                err.message || "Unable to update product."
            );

        } finally {

            setSaving(false);

        }
    };

    if (loading) {
        return (
            <div className="edit-product-loading">
                Loading product details...
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="admin-edit-product-page">

                <div className="add-product-alert error">
                    {error}
                </div>

                <button
                    className="add-product-back-btn"
                    onClick={() => navigate("/admin/products")}
                >
                    ← Back to Products
                </button>

            </div>
        );
    }

    return (

        <div className="admin-edit-product-page">

            <div className="add-product-header">

                <div>
                    <span className="add-product-eyebrow">
                        INVENTORY MANAGEMENT
                    </span>

                    <h1>Edit Product</h1>

                    <p>
                        Update product details, pricing, inventory and image.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-product-back-btn"
                    onClick={() => navigate("/admin/products")}
                >
                    ← Back to Products
                </button>

            </div>

            {error && (
                <div className="add-product-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="add-product-alert success">
                    {success}
                </div>
            )}

            <form
                className="add-product-form"
                onSubmit={handleSubmit}
            >

                <section className="add-product-card">

                    <div className="add-product-section-heading">
                        <h2>Product Information</h2>
                        <p>Update the medicine details.</p>
                    </div>

                    <div className="add-product-fields">

                        <div className="add-product-field full-width">
                            <label htmlFor="edit-name">Product Name *</label>

                            <input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="add-product-field full-width">
                            <label htmlFor="edit-description">
                                Description *
                            </label>

                            <textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="edit-category">Category *</label>

                            <input
                                id="edit-category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="edit-brand">Brand *</label>

                            <input
                                id="edit-brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                </section>

                <section className="add-product-card">

                    <div className="add-product-section-heading">
                        <h2>Pricing and Inventory</h2>
                        <p>Update prices and available stock.</p>
                    </div>

                    <div className="add-product-fields">

                        <div className="add-product-field">
                            <label htmlFor="edit-price">
                                Original Price (₹) *
                            </label>

                            <input
                                id="edit-price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="edit-discountPrice">
                                Discount Price (₹)
                            </label>

                            <input
                                id="edit-discountPrice"
                                name="discountPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.discountPrice}
                                onChange={handleChange}
                            />

                            <small>
                                Leave blank if no discount applies.
                            </small>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="edit-stock">
                                Available Stock *
                            </label>

                            <input
                                id="edit-stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                </section>

                <section className="add-product-card">

                    <div className="add-product-section-heading">
                        <h2>Product Image</h2>
                        <p>
                            Upload a replacement image if needed.
                        </p>
                    </div>

                    <div className="edit-product-image-area">

                        {imagePreview ? (

                            <div className="add-product-preview">
                                <img
                                    src={imagePreview}
                                    alt="New product preview"
                                />

                                <button
                                    type="button"
                                    onClick={removeSelectedImage}
                                >
                                    Remove Selected Image
                                </button>
                            </div>

                        ) : existingImage ? (

                            <div className="edit-product-current-image">
                                <img
                                    src={existingImage}
                                    alt={formData.name}
                                />

                                <p>Current product image</p>
                            </div>

                        ) : (

                            <div className="edit-product-no-image">
                                <span>💊</span>
                                <p>No product image available</p>
                            </div>

                        )}

                        <label
                            className="edit-product-upload-label"
                            htmlFor="edit-product-image"
                        >
                            Choose Replacement Image

                            <input
                                id="edit-product-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                            />
                        </label>

                        <small className="edit-product-image-help">
                            JPG, PNG or WEBP · Maximum 5 MB.
                            Leave unchanged to keep the existing image.
                        </small>

                    </div>

                </section>

                <div className="add-product-form-actions">

                    <button
                        type="button"
                        className="add-product-cancel-btn"
                        onClick={() => navigate("/admin/products")}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="add-product-submit-btn"
                        disabled={saving}
                    >
                        {saving ? "Updating Product..." : "Save Changes"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default AdminEditProduct;
