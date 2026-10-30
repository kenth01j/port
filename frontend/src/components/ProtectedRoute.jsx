import { Navigate } from "react-router-dom";

import { hasToken } from "../utils/api";

export default function ProtectedRoute({ children }) {
  return hasToken() ? children : <Navigate to="/admin" replace />;
}
