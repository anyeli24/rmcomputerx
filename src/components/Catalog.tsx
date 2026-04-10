import { useCatalogItems } from "@/hooks/use-site-data";
import { Skeleton } from "@/components/ui/skeleton";

const Catalog = () => {
  const { data: items, isLoading } = useCatalogItems();

  return (
    <section id="catalogo" className="py-20 bg-secondary">
      <div className="container text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4"> Servicios</h2>
          <p className="text-muted-foreground text-lg">
            Consulta nuestros servicios. Para cotizaciones especiales, contáctanos.
          </p>
        </div>

        <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">Servicio</th>
                      <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items?.map((item: any) => (
                      <tr key={item.id} data-service-id={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-all duration-300">
                        <td className="px-6 py-4 text-sm text-foreground font-medium text-center">{item.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#73dee8]">
                            {item.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {items?.map((item: any) => (
                  <div key={item.id} id={`service-${item.id}`} className="p-4 flex items-center justify-between gap-3 transition-all duration-300">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#73dee8] whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Catalog;
