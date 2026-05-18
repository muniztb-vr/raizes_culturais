# Raízes Culturais

> Plataforma de Extensão em Ação e Difusão Cultural — Programa de Extensão Universitária.

---

## Justificativa de Escolha Tecnológica

*Este documento atende à competência **"analisar e selecionar tecnologias adequadas"** prevista no Componente Curricular de Construção, Evolução e Avaliação de Software, articulando cada decisão técnica a critérios de adequação acadêmica, escalabilidade e impacto social.*

---

### 1. Backend — Java 17 + Spring Boot 3

| Critério de Análise | Justificativa |
|---|---|
| **Maturidade e estabilidade** | Java é linguagem de referência em sistemas corporativos; Spring Boot é o framework MVC mais adotado no ecossistema Java (ALVES, 2015) |
| **Produtividade acadêmica** | Injeção de dependências, autoconfiguração e convenção sobre configuração reduzem boilerplate, permitindo foco na lógica de domínio |
| **Longevidade (LTS)** | Java 17 é versão LTS com suporte estendido até 2029, adequada para projetos de extensão de longa duração |
| **Padrão MVC** | Separação explícita de Controller / Service / Repository favorece avaliação pedagógica por camadas |
| **Ecossistema de dependências** | Lombok elimina código repetitivo; DevTools habilita hot reload; Validation centraliza regras de entrada |

**Dependências selecionadas e seus papéis:**

```xml
spring-boot-starter-web        → Camada HTTP / REST (Controller MVC)
spring-boot-starter-data-jpa   → Abstração do banco via Repositórios (Padrão Repository)
spring-boot-starter-validation → Bean Validation (Jakarta EE) nas entidades e DTOs
postgresql                     → Driver JDBC para PostgreSQL
lombok                         → Redução de boilerplate (@Getter, @Builder, @Data)
spring-boot-devtools           → Reinicialização automática em ambiente de desenvolvimento
```

---

### 2. Frontend — React 18 + Vite + Tailwind CSS

| Critério de Análise | Justificativa |
|---|---|
| **React** | Biblioteca de UI baseada em componentes; ecossistema consolidado para SPAs; permite criar interfaces acessíveis (WCAG) com controle granular |
| **Vite** | Build tool moderna com Hot Module Replacement (HMR) nativo; tempo de arranque < 500ms vs. ~8s do CRA — relevante para ciclos ágeis acadêmicos |
| **Tailwind CSS** | Utility-first CSS que codifica o Design System diretamente nas classes; elimina CSS global disfuncional em projetos multi-desenvolvedor |

**Comando de instalação do projeto Vite + React:**

```bash
# Na raiz do projeto
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios
```

**Tokens do Design System no `tailwind.config.js`:**

```js
colors: {
  "forest-green": "#0A1F11",  // Cor primária — identidade cultural/rural
  "old-gold":     "#D4AF37",  // Cor de destaque — valor e patrimônio
  "silk-cream":   "#F5F5F5",  // Fundo — neutralidade e legibilidade
}
```

A escolha das cores segue princípios de contraste mínimo 4.5:1 (WCAG AA), decisão de IHC para garantir acessibilidade a produtores rurais com baixa familiaridade digital.

---

### 3. Banco de Dados — PostgreSQL

| Critério de Análise | Justificativa |
|---|---|
| **SGBD relacional** | Patrimônio cultural possui estrutura relacional bem definida (Produtores ↔ Manifestações ↔ Eventos) — SQL é a linguagem mais adequada |
| **Open Source** | Sem custo de licença; adequado para projetos de extensão com orçamento acadêmico |
| **JSONB nativo** | Flexibilidade para armazenar metadados culturais heterogêneos sem quebrar o esquema relacional |
| **Integração com JPA** | Hibernate + PostgreSQL Dialect oferece mapeamento ORM robusto estudado em Goodrich (2013) quanto ao impacto das estruturas de dados nas consultas |

---

### 4. Estrutura do Projeto

```
raizes-culturais/
├── backend/                          # API REST — Spring Boot
│   ├── pom.xml                       # Dependências Maven
│   └── src/main/
│       ├── java/br/edu/raizesculturais/
│       │   ├── RaizesCulturaisApplication.java
│       │   ├── controller/           # Camada MVC — endpoints REST
│       │   ├── service/              # Regras de negócio
│       │   ├── repository/           # Acesso a dados (Spring Data JPA)
│       │   ├── model/                # Entidades JPA (@Entity)
│       │   └── dto/                  # Data Transfer Objects
│       └── resources/
│           └── application.properties
├── frontend/                         # SPA — React + Vite
│   ├── src/
│   │   ├── components/               # Componentes reutilizáveis
│   │   ├── pages/                    # Páginas da aplicação
│   │   ├── services/                 # Comunicação com a API (axios)
│   │   └── hooks/                    # Custom hooks React
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

### 5. Alinhamento com ODS da ONU

| ODS | Meta | Contribuição do Projeto |
|---|---|---|
| **ODS 8** — Trabalho Decente | 8.3 — Promover empreendedorismo | Vitrine digital para produtos culturais de produtores rurais |
| **ODS 11** — Patrimônio Cultural | 11.4 — Salvaguardar patrimônio | Repositório digital de manifestações culturais imateriais |

---

## Referências Bibliográficas

- ALVES, W. P. *Java para Web: desenvolvimento de aplicações*. São Paulo: Érica, 2015.
- GOODRICH, M. T.; TAMASSIA, R. *Estruturas de Dados e Algoritmos em Java*. Porto Alegre: Bookman, 2013.
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.1*. 2018.
- ONU. *Agenda 2030 para o Desenvolvimento Sustentável*. Nova York: United Nations, 2015.

---

*Desenvolvido como Trabalho Acadêmico — Programa de Extensão em Ação e Difusão Cultural.*
