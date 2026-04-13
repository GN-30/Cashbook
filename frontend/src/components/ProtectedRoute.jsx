import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CoinLoader from "./CoinLoader";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <CoinLoader />;

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
