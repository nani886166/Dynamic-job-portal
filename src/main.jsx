import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes/AppRoutes.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </Provider>,
);
