import { useCategories } from "@/hooks/use-site-data";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section id="productos" className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Productos y Servicios</h2>
          <p className="text-muted-foreground text-lg">
            Explora nuestras categorías y encuentra lo que necesitas.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-background rounded-xl overflow-hidden shadow-sm border border-border">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : categories?.map((c: any) => (
                <div key={c.id} className="group bg-background rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={c.image_url}
                      alt={c.title}
                      loading="lazy"
                      width={640}
                      height={640}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
