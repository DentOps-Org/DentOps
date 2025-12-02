// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Props:
 *  - children
 *  - allowedRoles: array of strings OR objects, e.g.
 *      ['PATIENT']
 *      [{ role: 'DENTAL_STAFF', specializations: ['DENTIST'] }]
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const auth = useSelector((s) => s.auth);
  const location = useLocation();

  // Not logged in -> go to login
  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No role restriction -> allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Normalize to objects for checking
  const allowedObjs = allowedRoles.map((r) => (typeof r === "string" ? { role: r } : r));
  const user = auth.user;

  // If user not loaded for some reason, redirect to landing (safe fallback)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Compute whether user is allowed
  const allowed = allowedObjs.some((a) => {
    // If role specified and doesn't match, this allowedObj doesn't match
    if (a.role && user.role !== a.role) return false;

    // If specialization list provided, check that user's specialization is one of them
    if (a.specializations && a.specializations.length > 0) {
      return a.specializations.includes(user.specialization);
    }

    // role matches and no specialization constraint
    return true;
  });

  // If not allowed -> redirect to landing page (as you requested)
  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  // Allowed
  return children;
}
