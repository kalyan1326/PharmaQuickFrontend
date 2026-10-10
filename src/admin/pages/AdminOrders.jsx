
import { useCallback, useEffect, useMemo, useState } from "react";
// import { API_URL } from "../../config";
import "../css/AdminOrders.css";
const API_URL = import.meta.env.VITE_API_URL;

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const getOrderId = (order) => order.orderId;

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "You are not authorized to view admin orders. Please sign in as an administrator."
          );
        }

        throw new Error(`Unable to load orders (${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected orders response.");
      }

      setOrders(data);

      setSelectedOrder((current) => {
        if (!current) return current;

        return (
          data.find(
            (order) => getOrderId(order) === getOrderId(current)
          ) ?? null
        );
      });
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const address = order.shippingAddress ?? {};

      const matchesSearch =
        !query ||
        String(order.orderId ?? "").toLowerCase().includes(query) ||
        String(address.fullName ?? "").toLowerCase().includes(query) ||
        String(address.mobile ?? "").toLowerCase().includes(query) ||
        (order.items ?? []).some((item) =>
          String(item.productName ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "PENDING"
      ).length,
      processing: orders.filter(
        (order) => order.status === "PROCESSING"
      ).length,
      delivered: orders.filter(
        (order) => order.status === "DELIVERED"
      ).length,
    }),
    [orders]
  );

  const updateStatus = async (order, newStatus) => {
    const orderId = getOrderId(order);

    if (!orderId || !newStatus || newStatus === order.status) return;

    if (
      !window.confirm(
        `Change order #${orderId} from ${order.status} to ${newStatus}?`
      )
    ) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || `Unable to update order (${response.status}).`
        );
      }

      const updatedOrder = await response.json();

      setOrders((current) =>
        current.map((item) =>
          getOrderId(item) === orderId ? updatedOrder : item
        )
      );

      setSelectedOrder((current) =>
        current && getOrderId(current) === orderId
          ? updatedOrder
          : current
      );

      setNotice(`Order #${orderId} updated to ${updatedOrder.status}.`);
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${order.orderId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load order details.");
      }

      const details = await response.json();
      setSelectedOrder(details);
    } catch (err) {
      setError(err.message || "Unable to load order details.");
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-orders__header">
        <div>
          <p className="admin-orders__eyebrow">ORDER MANAGEMENT</p>
          <h1>Orders</h1>
          <p className="admin-orders__subtitle">
            View customer purchases and manage order progress.
          </p>
        </div>

        <button
          className="admin-orders__refresh"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="admin-orders__alert admin-orders__alert--error">
          {error}
        </div>
      )}

      {notice && (
        <div className="admin-orders__alert admin-orders__alert--success">
          {notice}
        </div>
      )}

      <div className="admin-orders__stats">
        <div className="admin-orders__stat">
          <span>Total orders</span>
          <strong>{summary.total}</strong>
        </div>

        <div className="admin-orders__stat">
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </div>

        <div className="admin-orders__stat">
          <span>Processing</span>
          <strong>{summary.processing}</strong>
        </div>

        <div className="admin-orders__stat">
          <span>Delivered</span>
          <strong>{summary.delivered}</strong>
        </div>
      </div>

      <div className="admin-orders__filters">
        <input
          type="search"
          placeholder="Search order, customer, mobile, or product..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search orders"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by order status"
        >
          <option value="ALL">All order statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          aria-label="Filter by payment status"
        >
          <option value="ALL">All payment statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      <div className="admin-orders__table-card">
        <div className="admin-orders__table-heading">
          <h2>All Orders</h2>
          <span>{filteredOrders.length} orders</span>
        </div>

        {loading ? (
          <div className="admin-orders__empty">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders__empty">
            No orders match your search or filters.
          </div>
        ) : (
          <div className="admin-orders__table-scroll">
            <table className="admin-orders__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>#{order.orderId}</strong>
                      <small>
                        {(order.items ?? []).length} item types
                      </small>
                    </td>

                    <td>
                      <strong>
                        {order.shippingAddress?.fullName || "Customer"}
                      </strong>
                      <small>
                        {order.shippingAddress?.mobile || "No mobile"}
                      </small>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </td>

                    <td>
                      <span
                        className={`admin-orders__badge admin-orders__badge--${String(
                          order.paymentStatus ?? "pending"
                        ).toLowerCase()}`}
                      >
                        {order.paymentStatus ?? "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-orders__badge admin-orders__badge--${String(
                          order.status ?? "pending"
                        ).toLowerCase()}`}
                      >
                        {order.status ?? "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-orders__actions">
                        <button
                          className="admin-orders__details"
                          onClick={() => openOrderDetails(order)}
                        >
                          Details
                        </button>

                        <select
                          aria-label={`Update order ${order.orderId} status`}
                          value={order.status}
                          disabled={
                            updatingOrderId === order.orderId ||
                            order.status === "DELIVERED" ||
                            order.status === "CANCELLED"
                          }
                          onChange={(event) =>
                            updateStatus(order, event.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="admin-orders__modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            className="admin-orders__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-details-title"
          >
            <div className="admin-orders__modal-header">
              <div>
                <span>ORDER DETAILS</span>
                <h2 id="admin-order-details-title">
                  Order #{selectedOrder.orderId}
                </h2>
              </div>

              <button
                className="admin-orders__close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className="admin-orders__modal-body">
              <div className="admin-orders__detail-grid">
                <div>
                  <span>Order date</span>
                  <strong>{formatDate(selectedOrder.createdAt)}</strong>
                </div>

                <div>
                  <span>Order status</span>
                  <strong>{selectedOrder.status}</strong>
                </div>

                <div>
                  <span>Payment status</span>
                  <strong>{selectedOrder.paymentStatus}</strong>
                </div>

                <div>
                  <span>Total amount</span>
                  <strong>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </strong>
                </div>
              </div>

              <h3>Shipping address</h3>

              {selectedOrder.shippingAddress ? (
                <div className="admin-orders__address">
                  <strong>
                    {selectedOrder.shippingAddress.fullName}
                  </strong>
                  <p>{selectedOrder.shippingAddress.mobile}</p>
                  <p>{selectedOrder.shippingAddress.addressLine}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state} -{" "}
                    {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              ) : (
                <p>Shipping address unavailable.</p>
              )}

              <h3>Order items</h3>

              <div className="admin-orders__items">
                {(selectedOrder.items ?? []).map((item) => (
                  <div
                    className="admin-orders__item"
                    key={item.orderItemId}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} />
                    ) : (
                      <div className="admin-orders__item-placeholder">
                        No image
                      </div>
                    )}

                    <div className="admin-orders__item-info">
                      <strong>{item.productName}</strong>
                      <span>
                        {formatCurrency(item.price)} × {item.quantity}
                      </span>
                    </div>

                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>

              <div className="admin-orders__modal-total">
                <span>Order total</span>
                <strong>
                  {formatCurrency(selectedOrder.totalAmount)}
                </strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
