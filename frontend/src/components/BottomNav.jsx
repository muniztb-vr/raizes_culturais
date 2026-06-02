import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { eventoService } from "../services/eventoService";
import { formatEventShort } from "../utils/produtorUtils";
import { useAuth } from "../context/AuthContext";

function HomeIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ShopIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function PeopleIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EventosIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function DashboardIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function LoginIcon({ active }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

function proximoEventoDaLista(eventos) {
  const hoje = new Date();
  return eventos.find((e) => new Date((e.dataFim || e.dataInicio) + "T23:59:59") >= hoje) || null;
}

export default function BottomNav() {
  const { produtor } = useAuth();
  const navigate = useNavigate();
  const [proximo, setProximo] = useState(undefined); // undefined = carregando, null = sem eventos
  const [bannerVisivel, setBannerVisivel] = useState(true);

  useEffect(() => {
    eventoService.listarAtivos()
      .then((data) => setProximo(proximoEventoDaLista(data)))
      .catch(() => setProximo(null));
  }, []);

  const TABS = [
    { to: "/",          label: "Início",    Icon: HomeIcon },
    { to: "/vitrine",   label: "Vitrine",   Icon: ShopIcon },
    { to: "/eventos",   label: "Eventos",   Icon: EventosIcon },
    { to: "/produtores",label: "Produtores",Icon: PeopleIcon },
    produtor
      ? { to: "/dashboard", label: "Painel", Icon: DashboardIcon }
      : { to: "/entrar",    label: "Entrar", Icon: LoginIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">

      {/* Banner — só mostra após carregar e se o usuário não fechou */}
      {proximo !== undefined && bannerVisivel && (
        <div className="px-4 pt-2 pb-0">
          <div className="bg-forest-green rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">

            {proximo ? (
              /* ── Evento real ── */
              <button
                onClick={() => navigate("/eventos")}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-old-gold text-[10px] font-bold uppercase tracking-widest">
                    Próximo Evento
                  </p>
                  <p className="text-silk-cream text-sm font-semibold leading-tight mt-0.5 truncate">
                    {proximo.nome}
                  </p>
                  <p className="text-silk-cream/60 text-xs mt-0.5">
                    {formatEventShort(proximo)}
                  </p>
                </div>
                <div className="shrink-0 w-9 h-9 bg-old-gold rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-forest-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ) : (
              /* ── Sem eventos cadastrados ── */
              <button
                onClick={() => navigate("/eventos")}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="shrink-0 w-9 h-9 bg-old-gold/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-old-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-old-gold text-[10px] font-bold uppercase tracking-widest">
                    Eventos
                  </p>
                  <p className="text-silk-cream/70 text-sm leading-tight mt-0.5">
                    Aguarde o próximo evento
                  </p>
                </div>
              </button>
            )}

            {/* Botão fechar */}
            <button
              onClick={() => setBannerVisivel(false)}
              aria-label="Fechar banner"
              className="shrink-0 -mr-1 w-11 h-11 flex items-center justify-center
                rounded-full text-silk-cream/50 hover:text-silk-cream
                hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Navegação inferior */}
      <nav className="bg-white border-t border-gray-100">
        <div className="flex justify-around">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-3 min-w-[52px] transition-colors ${
                  isActive ? "text-forest-green" : "text-gray-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

