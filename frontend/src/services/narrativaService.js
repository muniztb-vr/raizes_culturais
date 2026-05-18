import api from "./api";

export const narrativaService = {
  gerar: (transcricao) =>
    api.post("/narrativa/produtor", { transcricao }).then((r) => r.data),
};
