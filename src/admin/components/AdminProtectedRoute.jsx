
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function AdminProtectedRoute() {

    const [status, setStatus] = useState("checking");

    useEffect(() => {

        let active = true;

        const verifyAdmin = async () => {

            try {

                const response = await fetch(
                    `${API_URL}/api/admin/test`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                if (!active) return;

                if (response.ok) {
                    setStatus("authorized");
                } else {
                    setStatus("unauthorized");
                }

            } catch (error) {

                if (active) {
                    setStatus("unauthorized");
                }

            }
        };

        verifyAdmin();

        return () => {
            active = false;
        };

    }, []);

    if (status === "checking") {

        return (
            <div className="admin-auth-loading">
                Verifying admin access...
            </div>
        );

    }

    if (status === "unauthorized") {

        return <Navigate to="/admin/login" replace />;

    }

    return <Outlet />;
}

export default AdminProtectedRoute;
