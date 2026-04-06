const catalogItems = [
  { name: "Cuaderno universitario 200 páginas", category: "Escolar", price: "RD$ 150" },
  { name: "Set de lápices de colores (24 uds)", category: "Escolar", price: "RD$ 250" },
  { name: "Bolígrafos (caja de 12)", category: "Escolar", price: "RD$ 120" },
  { name: "Mochila escolar resistente", category: "Escolar", price: "" },
  { name: "Calculadora científica", category: "Escolar", price: "RD$ 450" },
  { name: "Kit de manualidades completo", category: "Manualidades", price: "RD$ 350" },
  { name: "Cartulina (paquete 10 uds)", category: "Manualidades", price: "RD$ 100" },
  { name: "Pegamento escolar 250ml", category: "Manualidades", price: "RD$ 80" },
  { name: "Mouse inalámbrico", category: "Tecnología", price: "RD$ 400" },
  { name: "Teclado USB", category: "Tecnología", price: "RD$ 500" },
  { name: "Memoria USB 32GB", category: "Tecnología", price: "RD$ 350" },
  { name: "Laptop (consultar modelos)", category: "Tecnología", price: "" },
  { name: "Impresión B/N (por página)", category: "Servicios", price: "RD$ 5" },
  { name: "Impresión a color (por página)", category: "Servicios", price: "RD$ 15" },
  { name: "Plastificado tamaño carta", category: "Servicios", price: "RD$ 50" },
];

const categoryColors: Record<string, string> = {
  Escolar: "bg-primary/10 text-primary",
  Manualidades: "bg-accent/10 text-accent",
  Tecnología: "bg-foreground/10 text-foreground",
  Servicios: "bg-whatsapp/10 text-whatsapp",
};

const Catalog = () => (
  <section id="catalogo" className="py-20 bg-secondary">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Catálogo de Precios</h2>
        <p className="text-muted-foreground text-lg">
          Consulta nuestros precios de referencia. Para cotizaciones especiales, contáctanos.
        </p>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Producto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Categoría</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Precio</th>
              </tr>
            </thead>
            <tbody>
              {catalogItems.map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[item.category] || ""}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-primary">
                    {item.price || <span className="text-muted-foreground font-normal">Consultar</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {catalogItems.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category] || ""}`}>
                  {item.category}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary whitespace-nowrap">
                {item.price || <span className="text-muted-foreground font-normal">Consultar</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Catalog;
