
import { useCallback, useEffect, useMemo, useState } from "react";
// import { API_URL } from "../../config";
const API_URL = import.meta.env.VITE_API_URL;
import "../css/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "You are not authorized. Please log in as an administrator."
          );
        }

        throw new Error(`Failed to load users (${response.status}).`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setUsers(data);

      setSelectedUser((current) =>
        current
          ? data.find((user) => user.userId === current.userId) ?? null
          : null
      );
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.userId ?? "").toLowerCase().includes(query) ||
        String(user.name ?? "").toLowerCase().includes(query) ||
        String(user.email ?? "").toLowerCase().includes(query) ||
        String(user.mobile ?? "").toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const customerCount = users.filter((user) => user.role === "USER").length;

  return (
    <div className="admin-users">
      <header className="admin-users__header">
        <div>
          <p className="admin-users__eyebrow">USER MANAGEMENT</p>
          <h1>Customers & Users</h1>
          <p className="admin-users__subtitle">
            View registered users and their account information.
          </p>
        </div>

        <button
          className="admin-users__refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="admin-users__alert" role="alert">
          {error}
        </div>
      )}

      <section className="admin-users__stats">
        <article className="admin-users__stat">
          <span>Total users</span>
          <strong>{users.length}</strong>
        </article>

        <article className="admin-users__stat">
          <span>Customers</span>
          <strong>{customerCount}</strong>
        </article>

        <article className="admin-users__stat">
          <span>Administrators</span>
          <strong>{adminCount}</strong>
        </article>
      </section>

      <section className="admin-users__card">
        <div className="admin-users__card-header">
          <div>
            <h2>Registered Users</h2>
            <p>{filteredUsers.length} users found</p>
          </div>
        </div>

        <div className="admin-users__filters">
          <input
            type="search"
            placeholder="Search ID, name, email, or mobile..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search users"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter users by role"
          >
            <option value="ALL">All roles</option>
            <option value="USER">Customers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-users__empty">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-users__empty">
            No users match your search.
          </div>
        ) : (
          <div className="admin-users__table-wrapper">
            <table className="admin-users__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="admin-users__identity">
                        <div className="admin-users__avatar">
                          {String(user.name || user.userId || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <strong>{user.name || "Unnamed user"}</strong>
                      </div>
                    </td>

                    <td>{user.userId}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile}</td>

                    <td>
                      <span
                        className={`admin-users__role admin-users__role--${String(
                          user.role || "unknown"
                        ).toLowerCase()}`}
                      >
                        {user.role || "UNKNOWN"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="admin-users__view"
                        onClick={() => setSelectedUser(user)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && (
        <div
          className="admin-users__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <section
            className="admin-users__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-modal-title"
          >
            <div className="admin-users__modal-header">
              <div>
                <span>USER PROFILE</span>
                <h2 id="admin-user-modal-title">
                  {selectedUser.name || "User details"}
                </h2>
              </div>

              <button
                className="admin-users__close"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details"
              >
                ×
              </button>
            </div>

            <div className="admin-users__modal-body">
              <div className="admin-users__profile-avatar">
                {String(
                  selectedUser.name || selectedUser.userId || "?"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {[
                ["User ID", selectedUser.userId],
                ["Full name", selectedUser.name],
                ["Email address", selectedUser.email],
                ["Mobile number", selectedUser.mobile],
                ["Account role", selectedUser.role],
              ].map(([label, value]) => (
                <div className="admin-users__detail" key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
