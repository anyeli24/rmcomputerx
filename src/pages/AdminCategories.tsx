import { useEffect, useMemo, useState } from "react";
import { useCategories, useCatalogItems } from "@/hooks/use-site-data";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, ArrowLeft, LogOut, Plus } from "lucide-react";
import CategoryItem from "@/components/admin/CategoryItem";
import CatalogItemAdmin from "@/components/admin/CatalogItemAdmin";
import SortableItem from "@/components/admin/SortableItem";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { CATEGORY_MEDIA_ACCEPT, getMediaKind, isAcceptedCategoryMedia } from "@/lib/media";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ADMIN_EMAILS = ["rmcomputerxp@gmail.com", "anyelinaguillermo4@gmail.com"];

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const { data: catalogItems, isLoading: catalogLoading } = useCatalogItems();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Category form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);

  // Catalog form
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [savingService, setSavingService] = useState(false);

  // Auth
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<"productos" | "servicios">("productos");

  const previewSrc = useMemo(
    () => (imageMethod === "upload" ? imagePreview : imageUrl.trim()),
    [imageMethod, imagePreview, imageUrl],
  );
  const previewKind = useMemo(() => getMediaKind(previewSrc), [previewSrc]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const getFriendlyErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : "Error al procesar la solicitud";
    if (message.toLowerCase().includes("row-level security"))
      return "Tu sesión no tiene permisos. Inicia sesión con Google e intenta de nuevo.";
    return message;
  };

  // ── File helpers ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isAcceptedCategoryMedia(file)) {
        toast.error("Solo se permiten archivos .jpeg, .jpg, .png, .webp y .mp4");
        e.target.value = "";
        return;
      }
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const baseName = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "archivo";
    const fileName = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}-${baseName}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // ── Category CRUD ──
  const handleAddCategory = async () => {
    if (!title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!session) { toast.error("Inicia sesión con Google"); return; }
    setSaving(true);
    try {
      let finalUrl = "";
      if (imageMethod === "upload" && imageFile) finalUrl = await uploadImage(imageFile);
      else if (imageMethod === "url" && imageUrl.trim()) finalUrl = imageUrl.trim();
      const maxSort = categories?.reduce((max, c: any) => Math.max(max, c.sort_order || 0), 0) ?? 0;
      const { data, error } = await supabase.from("categories").insert({ title: title.trim(), description: description.trim() || null, image_url: finalUrl || null, sort_order: maxSort + 1 }).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("No se pudo guardar");
      toast.success("Categoría agregada");
      setTitle(""); setDescription(""); setImageUrl(""); setImageFile(null); setImagePreview(null);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) { toast.error(getFriendlyErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!session) { toast.error("Inicia sesión"); return; }
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { data, error } = await supabase.from("categories").delete().eq("id", id).select("id");
    if (error) { toast.error(getFriendlyErrorMessage(error)); return; }
    if (!data?.length) { toast.error("No se pudo eliminar."); return; }
    toast.success("Categoría eliminada");
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // ── Catalog CRUD ──
  const handleAddService = async () => {
    if (!serviceName.trim() || !serviceCategory.trim()) { toast.error("Nombre y categoría son obligatorios"); return; }
    if (!session) { toast.error("Inicia sesión con Google"); return; }
    setSavingService(true);
    try {
      const maxSort = catalogItems?.reduce((max, c: any) => Math.max(max, c.sort_order || 0), 0) ?? 0;
      const { error } = await supabase.from("catalog_items").insert({ name: serviceName.trim(), category: serviceCategory.trim(), sort_order: maxSort + 1 }).select("id").single();
      if (error) throw error;
      toast.success("Servicio agregado");
      setServiceName(""); setServiceCategory("");
      await queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
    } catch (err) { toast.error(getFriendlyErrorMessage(err)); }
    finally { setSavingService(false); }
  };

  const handleDeleteService = async (id: string) => {
    if (!session) { toast.error("Inicia sesión"); return; }
    if (!confirm("¿Eliminar este servicio?")) return;
    const { data, error } = await supabase.from("catalog_items").delete().eq("id", id).select("id");
    if (error) { toast.error(getFriendlyErrorMessage(error)); return; }
    if (!data?.length) { toast.error("No se pudo eliminar."); return; }
    toast.success("Servicio eliminado");
    await queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
  };

  // ── Drag & drop ──
  const handleDragEndCategories = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !categories) return;
    const oldIndex = categories.findIndex((c: any) => c.id === active.id);
    const newIndex = categories.findIndex((c: any) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...categories], oldIndex, newIndex);
    // Optimistic update
    queryClient.setQueryData(["categories"], reordered);
    // Persist
    try {
      await Promise.all(reordered.map((c: any, i: number) =>
        supabase.from("categories").update({ sort_order: i }).eq("id", c.id)
      ));
    } catch {
      toast.error("Error al reordenar");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  };

  const handleDragEndCatalog = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !catalogItems) return;
    const oldIndex = catalogItems.findIndex((c: any) => c.id === active.id);
    const newIndex = catalogItems.findIndex((c: any) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...catalogItems], oldIndex, newIndex);
    queryClient.setQueryData(["catalog_items"], reordered);
    try {
      await Promise.all(reordered.map((c: any, i: number) =>
        supabase.from("catalog_items").update({ sort_order: i }).eq("id", c.id)
      ));
    } catch {
      toast.error("Error al reordenar");
      await queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
    }
  };

  // ── Auth ──
  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (result.error) toast.error(result.error.message || "No se pudo iniciar sesión");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error(error.message); return; }
    toast.success("Sesión cerrada");
  };

  // ── Loading / Auth gates ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary p-4 sm:p-8">
        <div className="max-w-md mx-auto bg-background rounded-xl border border-border p-6 text-center">
          <p className="text-muted-foreground">Verificando acceso al panel...</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false;

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary p-4 sm:p-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Panel Administrativo</h1>
          </div>
          <div className="bg-background rounded-xl border border-border p-6 space-y-4 text-center">
            {session && !isAdmin ? (
              <>
                <h2 className="text-xl font-semibold text-foreground">Acceso denegado</h2>
                <p className="text-sm text-muted-foreground">Tu cuenta no tiene permisos.</p>
                <Button variant="outline" onClick={handleSignOut} className="w-full gap-2"><LogOut className="h-4 w-4" /> Cerrar sesión</Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-foreground">Inicia sesión</h2>
                <p className="text-sm text-muted-foreground">Necesitas una sesión con Google para acceder al panel administrativo.</p>
                <Button onClick={handleGoogleSignIn} className="w-full">Continuar con Google</Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Panel Administrativo</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="productos">Productos / Categorías</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
          </TabsList>

          {/* ── PRODUCTOS TAB ── */}
          <TabsContent value="productos" className="space-y-6 mt-6">
            {/* Add category form */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Agregar categoría</h2>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Papelería" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción breve..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Archivo o URL</Label>
                <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as "upload" | "url")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload" className="gap-1.5"><Upload className="h-4 w-4" /> Subir archivo</TabsTrigger>
                    <TabsTrigger value="url" className="gap-1.5"><Link className="h-4 w-4" /> URL de archivo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-3">
                    <Input type="file" accept={CATEGORY_MEDIA_ACCEPT} onChange={handleFileChange} />
                    <p className="mt-2 text-xs text-muted-foreground">Formatos: .jpeg, .jpg, .png, .webp y .mp4</p>
                    {previewSrc && previewKind === "video" && <video src={previewSrc} muted loop autoPlay playsInline controls className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />}
                    {previewSrc && previewKind === "image" && <img src={previewSrc} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />}
                  </TabsContent>
                  <TabsContent value="url" className="mt-3">
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/archivo.jpg" />
                    {previewSrc && previewKind === "video" && <video src={previewSrc} muted loop autoPlay playsInline controls className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />}
                    {previewSrc && previewKind === "image" && <img src={previewSrc} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />}
                  </TabsContent>
                </Tabs>
              </div>
              <Button onClick={handleAddCategory} disabled={saving} className="w-full">
                {saving ? "Guardando..." : "Agregar categoría"}
              </Button>
            </div>

            {/* Categories list with drag & drop */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Categorías existentes</h2>
              <p className="text-xs text-muted-foreground">Arrastra el ícono ⠿ para reordenar</p>
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Cargando...</p>
              ) : !categories?.length ? (
                <p className="text-muted-foreground text-sm">No hay categorías aún.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
                  <SortableContext items={categories.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y divide-border">
                      {categories.map((c: any) => (
                        <SortableItem key={c.id} id={c.id}>
                          <CategoryItem category={c} onDelete={handleDeleteCategory} />
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </TabsContent>

          {/* ── SERVICIOS TAB ── */}
          <TabsContent value="servicios" className="space-y-6 mt-6">
            {/* Add service form */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Agregar servicio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del servicio</Label>
                  <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ej: Impresión a color" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Input value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} placeholder="Ej: Impresión" />
                </div>
              </div>
              <Button onClick={handleAddService} disabled={savingService} className="w-full gap-2">
                <Plus className="h-4 w-4" /> {savingService ? "Guardando..." : "Agregar servicio"}
              </Button>
            </div>

            {/* Services list with drag & drop */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Servicios existentes</h2>
              <p className="text-xs text-muted-foreground">Arrastra el ícono ⠿ para reordenar</p>
              {catalogLoading ? (
                <p className="text-muted-foreground text-sm">Cargando...</p>
              ) : !catalogItems?.length ? (
                <p className="text-muted-foreground text-sm">No hay servicios aún.</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCatalog}>
                  <SortableContext items={catalogItems.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y divide-border">
                      {catalogItems.map((item: any) => (
                        <SortableItem key={item.id} id={item.id}>
                          <CatalogItemAdmin item={item} onDelete={handleDeleteService} />
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCategories;
