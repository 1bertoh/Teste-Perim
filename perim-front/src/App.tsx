import { Route, Routes } from "react-router-dom";

import NovaEntregaPage from "./pages/entregas";
import CadastroClienteForm from "./pages/clientes";
import Dashboard from "./pages";
import Page from "./pages/entregadores";

function App() {
  return (
    <Routes>
      <Route element={<Dashboard />} path="/" />
      <Route element={<NovaEntregaPage />} path="/entregas" />
      <Route element={<CadastroClienteForm />} path="/clientes" />
      <Route element={<Page />} path="/entregadores" />
    </Routes>
  );
}

export default App;
