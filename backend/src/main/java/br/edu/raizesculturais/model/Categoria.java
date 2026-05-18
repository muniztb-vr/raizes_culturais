package br.edu.raizesculturais.model;

public enum Categoria {
    AGROINDUSTRIA("Agroindústria"),
    ARTESANATO("Artesanato"),
    LATICINIOS("Laticínios"),
    CAFE("Café");

    private final String label;

    Categoria(String label) { this.label = label; }

    public String getLabel() { return label; }
}
