
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminAddProduct.css";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function AdminAddProduct() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        brand: "PharmaQuick",
        price: "",
        discountPrice: "",
        stock: ""
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

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

            setLoading(true);

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
                `${API_URL}/api/products`,
                {
                    method: "POST",
                    credentials: "include",
                    body
                }
            );

            const responseText = await response.text();

            let data = {};

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                data = { message: responseText };
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    responseText ||
                    "Unable to create product."
                );
            }

            setSuccess("Product added successfully!");

            setTimeout(() => {
                navigate("/admin/products", {
                    state: {
                        message: "Product added successfully!"
                    }
                });
            }, 800);

        } catch (err) {

            setError(
                err.message || "Unable to create product."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="admin-add-product-page">

            <div className="add-product-header">

                <div>
                    <span className="add-product-eyebrow">
                        INVENTORY MANAGEMENT
                    </span>

                    <h1>Add Product</h1>

                    <p>
                        Add a medicine or healthcare product to your catalog.
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
                        <p>Enter the basic details of the product.</p>
                    </div>

                    <div className="add-product-fields">

                        <div className="add-product-field full-width">
                            <label htmlFor="name">
                                Product Name *
                            </label>

                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol 500mg"
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="add-product-field full-width">
                            <label htmlFor="description">
                                Description *
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the product..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="category">
                                Category *
                            </label>

                            <input
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g. Tablets, Syrup, Ointment"
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="brand">
                                Brand *
                            </label>

                            <input
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Enter brand name"
                                required
                            />
                        </div>

                    </div>

                </section>

                <section className="add-product-card">

                    <div className="add-product-section-heading">
                        <h2>Pricing and Inventory</h2>
                        <p>Set the product price and available stock.</p>
                    </div>

                    <div className="add-product-fields">

                        <div className="add-product-field">
                            <label htmlFor="price">
                                Original Price (₹) *
                            </label>

                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="50.00"
                                required
                            />
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="discountPrice">
                                Discount Price (₹)
                            </label>

                            <input
                                id="discountPrice"
                                name="discountPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.discountPrice}
                                onChange={handleChange}
                                placeholder="45.00"
                            />

                            <small>
                                Leave blank if no discount applies.
                            </small>
                        </div>

                        <div className="add-product-field">
                            <label htmlFor="stock">
                                Available Stock *
                            </label>

                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="100"
                                required
                            />
                        </div>

                    </div>

                </section>

                <section className="add-product-card">

                    <div className="add-product-section-heading">
                        <h2>Product Image</h2>
                        <p>
                            Upload a JPG, PNG or WEBP image, up to 5 MB.
                        </p>
                    </div>

                    <div className="add-product-upload-area">

                        {imagePreview ? (

                            <div className="add-product-preview">
                                <img
                                    src={imagePreview}
                                    alt="Product preview"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        URL.revokeObjectURL(imagePreview);
                                        setImage(null);
                                        setImagePreview("");
                                    }}
                                >
                                    Remove Image
                                </button>
                            </div>

                        ) : (

                            <label
                                className="add-product-upload-label"
                                htmlFor="image"
                            >
                                <span className="upload-image-icon">
                                    ☁
                                </span>

                                <strong>
                                    Click to upload product image
                                </strong>

                                <span>
                                    JPG, PNG or WEBP · Maximum 5 MB
                                </span>

                                <input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                />
                            </label>

                        )}

                    </div>

                    <p className="add-product-image-note">
                        Images are uploaded through your existing backend
                        ImageKit integration. The image is optional if your
                        backend supports products without images.
                    </p>

                </section>

                <div className="add-product-form-actions">

                    <button
                        type="button"
                        className="add-product-cancel-btn"
                        onClick={() => navigate("/admin/products")}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="add-product-submit-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving Product..."
                            : "Save Product"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default AdminAddProduct;
