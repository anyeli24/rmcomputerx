import catManualidades from "@/assets/cat-manualidades.jpg";
import catEscolar from "@/assets/cat-escolar.jpg";
import catTecnologia from "@/assets/cat-tecnologia.jpg";
import catServicios from "@/assets/cat-servicios.jpg";

const categories = [
  {
    title: "Materiales para Manualidades",
    desc: "Tijeras, pegamento, cartulinas, marcadores, cintas decorativas y más.",
    img: catManualidades,
  },
  {
    title: "Artículos Escolares",
    desc: "Cuadernos, lápices, bolígrafos, mochilas, calculadoras y todo lo que necesitas.",
    img: catEscolar,
  },
  {
    title: "Tecnología",
    desc: "Laptops, mouse, teclados, cables, memorias USB y accesorios de computadora.",
    img: catTecnologia,
  },
  {
    title: "Servicios",
    desc: "Impresión a color y blanco/negro, plastificado, encuadernación y más.",
    img: catServicios,
  },
];

const Products = () => (
  <section id="productos" className="py-20">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Productos y Servicios</h2>
        <p className="text-muted-foreground text-lg">
          Explora nuestras categorías y encuentra lo que necesitas.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c) => (
          <div key={c.title} className="group bg-background rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-square overflow-hidden">
              <img
                src={c.img}
                alt={c.title}
                loading="lazy"
                width={640}
                height={640}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-foreground text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Products;
