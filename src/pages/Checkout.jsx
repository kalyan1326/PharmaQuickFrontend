import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Checkout.css";

const API_URL = import.meta.env.VITE_API_URL;

function Checkout() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: ""
    });

    // -----------------------------------------
    // Load Razorpay Checkout Script
    // -----------------------------------------
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // Already loaded
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    // -----------------------------------------
    // Load Cart
    // -----------------------------------------
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/api/cart`, {
                    method: "GET",
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Failed to load cart");
                }

                const data = await response.json();

                // Handle different possible response structures
                if (Array.isArray(data)) {
                    setCartItems(data);
                } else if (Array.isArray(data.items)) {
                    setCartItems(data.items);
                } else {
                    setCartItems([]);
                }

            } catch (err) {
                console.error("Cart loading error:", err);
                setError(err.message || "Unable to load cart");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    // -----------------------------------------
    // Handle Input
    // -----------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // -----------------------------------------
    // Calculate Subtotal
    // -----------------------------------------
    const subtotal = cartItems.reduce((total, item) => {
        const price = Number(
            item.price ??
            item.product?.discountPrice ??
            item.product?.price ??
            0
        );

        const quantity = Number(item.quantity ?? 1);

        return total + price * quantity;
    }, 0);

    // -----------------------------------------
    // Delivery Charge
    // -----------------------------------------
    const deliveryCharge = subtotal >= 500 ? 0 : 40;

    const totalAmount = subtotal + deliveryCharge;

    // -----------------------------------------
    // Validate Form
    // -----------------------------------------
    const validateForm = () => {
        if (!formData.fullName.trim()) {
            return "Please enter your full name";
        }

        if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            return "Please enter a valid 10-digit mobile number";
        }

        if (!formData.addressLine.trim()) {
            return "Please enter your address";
        }

        if (!formData.city.trim()) {
            return "Please enter your city";
        }

        if (!formData.state.trim()) {
            return "Please enter your state";
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
            return "Please enter a valid 6-digit pincode";
        }

        if (cartItems.length === 0) {
            return "Your cart is empty";
        }

        return "";
    };

    // -----------------------------------------
    // Verify Razorpay Payment
    // -----------------------------------------
    const verifyPayment = async (
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    ) => {
        try {
            const response = await fetch(`${API_URL}/api/payments/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    orderId: orderId,
                    razorpayOrderId: razorpayOrderId,
                    razorpayPaymentId: razorpayPaymentId,
                    razorpaySignature: razorpaySignature
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Payment verification failed"
                );
            }

            console.log("Payment verified successfully:", data);

            // Payment successful
            navigate(`/orders/${orderId}`);

        } catch (err) {
            console.error("Payment verification error:", err);

            setError(
                err.message ||
                "Payment verification failed. Please contact support."
            );

            setPlacingOrder(false);
        }
    };

    // -----------------------------------------
    // Open Razorpay Checkout
    // -----------------------------------------
    const openRazorpayCheckout = async (orderId, paymentData) => {
        const razorpayLoaded = await loadRazorpayScript();

        if (!razorpayLoaded) {
            throw new Error(
                "Unable to load Razorpay. Please check your internet connection."
            );
        }

        const options = {
            key: paymentData.razorpayKeyId,

            // Backend amount is normally in rupees.
            // Razorpay expects paise.
            amount: Math.round(Number(paymentData.amount) * 100),

            currency: paymentData.currency || "INR",

            name: "PharmaQuick",

            description: `PharmaQuick Order #${orderId}`,

            order_id: paymentData.razorpayOrderId,

            prefill: {
                name: formData.fullName,
                contact: formData.mobile
            },

            notes: {
                orderId: String(orderId)
            },

            theme: {
                color: "#16a34a"
            },

            handler: async function (response) {
                console.log("Razorpay payment response:", response);

                await verifyPayment(
                    orderId,
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature
                );
            },

            modal: {
                ondismiss: function () {
                    console.log("Razorpay checkout closed");

                    setError(
                        "Payment was cancelled or the payment window was closed."
                    );

                    setPlacingOrder(false);
                }
            }
        };

        const razorpay = new window.Razorpay(options);

        // Payment failure event
        razorpay.on("payment.failed", function (response) {
            console.error(
                "Razorpay payment failed:",
                response.error
            );

            setError(
                response?.error?.description ||
                "Payment failed. Please try again."
            );

            setPlacingOrder(false);
        });

        razorpay.open();
    };

    // -----------------------------------------
    // Create Razorpay Payment Order
    // -----------------------------------------
    const createPayment = async (orderId) => {
        const response = await fetch(`${API_URL}/api/payments/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                orderId: orderId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.message ||
                "Unable to create payment order"
            );
        }

        console.log("Payment order created:", data);

        return data;
    };

    // -----------------------------------------
    // Create PharmaQuick Order
    // -----------------------------------------
    const createOrder = async () => {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                shippingAddress: {
                    fullName: formData.fullName.trim(),
                    mobile: formData.mobile.trim(),
                    addressLine: formData.addressLine.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.message ||
                "Unable to create order"
            );
        }

        console.log("PharmaQuick order created:", data);

        return data;
    };

    // -----------------------------------------
    // Pay Now
    // -----------------------------------------
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setPlacingOrder(true);

            // -----------------------------------------
            // STEP 1: Create PharmaQuick Order
            // -----------------------------------------
            const orderData = await createOrder();

            const orderId =
                orderData?.orderId ??
                orderData?.id;

            if (!orderId) {
                throw new Error(
                    "Order created but order ID was not returned."
                );
            }

            console.log("Created Order ID:", orderId);

            // -----------------------------------------
            // STEP 2: Create Razorpay Order
            // -----------------------------------------
            const paymentData = await createPayment(orderId);

            console.log(
                "Razorpay Order ID:",
                paymentData.razorpayOrderId
            );

            // -----------------------------------------
            // STEP 3: Open Razorpay Checkout
            // -----------------------------------------
            await openRazorpayCheckout(
                orderId,
                paymentData
            );

        } catch (err) {
            console.error("Checkout error:", err);

            setError(
                err.message ||
                "Something went wrong while processing your order."
            );

            setPlacingOrder(false);
        }
    };

    // -----------------------------------------
    // Loading
    // -----------------------------------------
    if (loading) {
        return (
            <div className="checkout-page">
                <div className="checkout-loading">
                    Loading your cart...
                </div>
            </div>
        );
    }

    // -----------------------------------------
    // Empty Cart
    // -----------------------------------------
    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <h2>Your cart is empty</h2>

                    <p>
                        Add some medicines before proceeding to checkout.
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------------------
    // JSX
    // -----------------------------------------
    return (
        <div className="checkout-page">

            <div className="checkout-container">

                {/* -------------------------------- */}
                {/* Left Side - Address */}
                {/* -------------------------------- */}

                <div className="checkout-form-section">

                    <div className="checkout-header">
                        <h1>Checkout</h1>

                        <p>
                            Enter your delivery details and complete your
                            payment securely.
                        </p>
                    </div>

                    {error && (
                        <div className="checkout-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder}>

                        <div className="form-section">

                            <h2>Delivery Address</h2>

                            <div className="form-group">
                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    disabled={placingOrder}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Mobile Number
                                </label>

                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    disabled={placingOrder}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Address
                                </label>

                                <textarea
                                    name="addressLine"
                                    value={formData.addressLine}
                                    onChange={handleChange}
                                    placeholder="House number, street, area"
                                    rows="3"
                                    disabled={placingOrder}
                                />
                            </div>

                            <div className="form-row">

                                <div className="form-group">
                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        disabled={placingOrder}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        disabled={placingOrder}
                                    />
                                </div>

                            </div>

                            <div className="form-group">

                                <label>
                                    Pincode
                                </label>

                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="6-digit pincode"
                                    maxLength="6"
                                    disabled={placingOrder}
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={placingOrder}
                        >
                            {placingOrder
                                ? "Processing..."
                                : `Pay ₹${totalAmount.toFixed(2)}`
                            }
                        </button>

                    </form>

                </div>

                {/* -------------------------------- */}
                {/* Right Side - Order Summary */}
                {/* -------------------------------- */}

                <div className="checkout-summary">

                    <h2>Order Summary</h2>

                    <div className="summary-items">

                        {cartItems.map((item) => {

                            const productName =
                                item.product?.name ??
                                item.name ??
                                "Product";

                            const price = Number(
                                item.price ??
                                item.product?.discountPrice ??
                                item.product?.price ??
                                0
                            );

                            const quantity =
                                Number(item.quantity ?? 1);

                            return (
                                <div
                                    className="summary-item"
                                    key={
                                        item.product?.productId ??
                                        item.productId
                                    }
                                >

                                    <div className="summary-item-info">

                                        <h3>
                                            {productName}
                                        </h3>

                                        <p>
                                            Qty: {quantity}
                                        </p>

                                    </div>

                                    <span>
                                        ₹{(price * quantity).toFixed(2)}
                                    </span>

                                </div>
                            );
                        })}

                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-row">
                        <span>
                            Subtotal
                        </span>

                        <span>
                            ₹{subtotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="summary-row">
                        <span>
                            Delivery
                        </span>

                        <span>
                            {deliveryCharge === 0
                                ? "FREE"
                                : `₹${deliveryCharge.toFixed(2)}`
                            }
                        </span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="summary-total">

                        <span>
                            Total
                        </span>

                        <span>
                            ₹{totalAmount.toFixed(2)}
                        </span>

                    </div>

                    <div className="payment-info">

                        <div className="payment-icon">
                            🔒
                        </div>

                        <div>
                            <strong>
                                Secure Payment
                            </strong>

                            <p>
                                Payments are securely processed
                                through Razorpay.
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Checkout;