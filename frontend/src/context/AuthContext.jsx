import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const GESTOR_DEFAULTS = { email: "gestor@raizes.edu.br", senha: "gestor2025" };

function getCredenciaisGestor() {
  try {
    const saved = localStorage.getItem("raizes_gestor_creds");
    return saved ? JSON.parse(saved) : GESTOR_DEFAULTS;
  } catch {
    return GESTOR_DEFAULTS;
  }
}

export function AuthProvider({ children }) {
  const [produtor, setProdutor] = useState(() => {
    try {
      const saved = localStorage.getItem("raizes_produtor");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [gestor, setGestor] = useState(() => {
    try {
      return localStorage.getItem("raizes_gestor") === "true";
    } catch {
      return false;
    }
  });

  // ── Produtor ──────────────────────────────────────────────────────────────

  const login = useCallback((data) => {
    setProdutor(data);
    localStorage.setItem("raizes_produtor", JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setProdutor(null);
    localStorage.removeItem("raizes_produtor");
  }, []);

  const atualizarProdutor = useCallback((parcial) => {
    setProdutor((prev) => {
      const atualizado = { ...prev, ...parcial };
      localStorage.setItem("raizes_produtor", JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  // ── Gestor ────────────────────────────────────────────────────────────────

  const loginGestor = useCallback((email, senha) => {
    const creds = getCredenciaisGestor();
    if (email.trim() === creds.email && senha === creds.senha) {
      setGestor(true);
      localStorage.setItem("raizes_gestor", "true");
      return true;
    }
    return false;
  }, []);

  const logoutGestor = useCallback(() => {
    setGestor(false);
    localStorage.removeItem("raizes_gestor");
  }, []);

  const atualizarCredenciaisGestor = useCallback((novoEmail, novaSenha) => {
    localStorage.setItem("raizes_gestor_creds", JSON.stringify({ email: novoEmail, senha: novaSenha }));
  }, []);

  return (
    <AuthContext.Provider value={{
      produtor, login, logout, atualizarProdutor,
      gestor, loginGestor, logoutGestor, atualizarCredenciaisGestor,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
