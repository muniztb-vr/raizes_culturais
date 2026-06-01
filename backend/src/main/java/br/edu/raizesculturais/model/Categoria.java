package br.edu.raizesculturais.model;

public enum Categoria {
    CAFES("Cafés"),
    AGROINDUSTRIA("Agroindústria"),
    HORTIFRUTI_ORGANICO("Hortifrúti Orgânico"),
    HORTIFRUTI_AGROECOLOGICO("Hortifrúti Agroecológicos"),
    ARTESANATO("Artesanatos"),
    LICORES_CACHACAS("Licores e Cachaças Artesanais");

    private final String label;

    Categoria(String label) { this.label = label; }

    public String getLabel() { return label; }
}
