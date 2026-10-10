const API_URL = import.meta.env.VITE_API_URL;


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = async () => {

    const response = await fetch(
        `${API_URL}/api/products`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch products"
        );
    }

    return await response.json();
};


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = async (productId) => {

    const response = await fetch(
        `${API_URL}/api/products/${productId}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch product"
        );
    }

    return await response.json();
};


// =====================================================
// SEARCH PRODUCTS
// =====================================================

export const searchProducts = async (name) => {

    const response = await fetch(
        `${API_URL}/api/products/search?name=${encodeURIComponent(name)}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to search products"
        );
    }

    return await response.json();
};


// =====================================================
// GET PRODUCTS BY CATEGORY
// =====================================================

export const getProductsByCategory = async (category) => {

    const response = await fetch(
        `${API_URL}/api/products/category/${encodeURIComponent(category)}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch category products"
        );
    }

    return await response.json();
};


// =====================================================
// GET PRODUCTS BY BRAND
// =====================================================

export const getProductsByBrand = async (brand) => {

    const response = await fetch(
        `${API_URL}/api/products/brand/${encodeURIComponent(brand)}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to fetch brand products"
        );
    }

    return await response.json();
};