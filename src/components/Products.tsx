import { useCategories } from "@/hooks/use-site-data";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaKind } from "@/lib/media";

const Products = () => {
  const { data: categories, isLoading } = useCategories();

  return (
    <section id="productos" className="py-20">
      <div className="container text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Productos</h2>
          <p className="text-muted-foreground text-lg">
            Explora nuestros productos y encuentra lo que necesitas.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
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
                  <div className="aspect-square overflow-hidden bg-muted">
                    {c.image_url ? (
                      getMediaKind(c.image_url) === "video" ? (
                        <video
                          src={c.image_url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={c.image_url}
                          alt={c.title}
                          loading="lazy"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Sin imagen
                      </div>
                    )}
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
