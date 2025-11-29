import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromToken } from "./redux/slices/authSlice";
import AppRouter from "./router/AppRouter";

export default function App() {
  const dispatch = useDispatch();

  // Auto-login on app load
  useEffect(() => {
    dispatch(loadUserFromToken());
  }, [dispatch]);

  return <AppRouter />;
}
