import { useEffect, useMemo, useState } from "react";
import { useCategories } from "@/hooks/use-site-data";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Trash2, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { CATEGORY_MEDIA_ACCEPT, getMediaKind, isAcceptedCategoryMedia } from "@/lib/media";
const ADMIN_EMAIL = "rmcomputerxp@gmail.com";

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const previewSrc = useMemo(
    () => (imageMethod === "upload" ? imagePreview : imageUrl.trim()),
    [imageMethod, imagePreview, imageUrl],
  );
  const previewKind = useMemo(() => getMediaKind(previewSrc), [previewSrc]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const getFriendlyErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : "Error al procesar la solicitud";

    if (message.toLowerCase().includes("row-level security")) {
      return "Tu sesión no tiene permisos para gestionar categorías. Inicia sesión con Google e intenta de nuevo.";
    }

    return message;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isAcceptedCategoryMedia(file)) {
        toast.error("Solo se permiten archivos .jpeg, .jpg, .png, .webp y .mp4");
        e.target.value = "";
        return;
      }

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const baseName = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "archivo";
    const fileName = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}-${baseName}.${ext}`;
    const { error } = await supabase.storage
      .from("site-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    if (!session) {
      toast.error("Inicia sesión con Google para agregar categorías");
      return;
    }

    setSaving(true);
    try {
      let finalUrl = "";
      if (imageMethod === "upload" && imageFile) {
        finalUrl = await uploadImage(imageFile);
      } else if (imageMethod === "url" && imageUrl.trim()) {
        finalUrl = imageUrl.trim();
      }

      const maxSort = categories?.reduce((max, c: any) => Math.max(max, c.sort_order || 0), 0) ?? 0;

      const { data, error } = await supabase
        .from("categories")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: finalUrl || null,
          sort_order: maxSort + 1,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (!data) throw new Error("No se pudo guardar la categoría");

      toast.success("Categoría agregada");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });

    if (result.error) {
      toast.error(result.error.message || "No se pudo iniciar sesión");
    }

    if (result.redirected) {
      return;
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message || "No se pudo cerrar sesión");
      return;
    }

    toast.success("Sesión cerrada");
  };

  const handleDelete = async (id: string) => {
    if (!session) {
      toast.error("Inicia sesión con Google para eliminar categorías");
      return;
    }

    if (!confirm("¿Eliminar esta categoría?")) return;

    const { data, error } = await supabase.from("categories").delete().eq("id", id).select("id");

    if (error) {
      toast.error(getFriendlyErrorMessage(error));
      return;
    }

    if (!data?.length) {
      toast.error("No se pudo eliminar la categoría. Inicia sesión de nuevo e intenta otra vez.");
      return;
    }

    toast.success("Categoría eliminada");
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary p-4 sm:p-8">
        <div className="max-w-md mx-auto bg-background rounded-xl border border-border p-6 text-center">
          <p className="text-muted-foreground">Verificando acceso al panel...</p>
        </div>
      </div>
    );
  }

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary p-4 sm:p-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Administrar Productos</h1>
          </div>

          <div className="bg-background rounded-xl border border-border p-6 space-y-4 text-center">
            {session && !isAdmin ? (
              <>
                <h2 className="text-xl font-semibold text-foreground">Acceso denegado</h2>
                <p className="text-sm text-muted-foreground">
                  Tu cuenta no tiene permisos para acceder al panel administrativo.
                </p>
                <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-foreground">Inicia sesión para administrar categorías</h2>
                <p className="text-sm text-muted-foreground">
                  Necesitas una sesión con Google para agregar, eliminar y subir archivos al panel administrativo.
                </p>
                <Button onClick={handleGoogleSignIn} className="w-full">
                  Continuar con Google
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Administrar Productos</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </div>

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
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="h-4 w-4" /> Subir archivo
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-1.5">
                  <Link className="h-4 w-4" /> URL de archivo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-3">
                <Input type="file" accept={CATEGORY_MEDIA_ACCEPT} onChange={handleFileChange} />
                <p className="mt-2 text-xs text-muted-foreground">Formatos permitidos: .jpeg, .jpg, .png, .webp y .mp4</p>
                {previewSrc && previewKind === "video" && (
                  <video
                    src={previewSrc}
                    muted
                    loop
                    autoPlay
                    playsInline
                    controls
                    className="mt-3 w-32 h-32 object-cover rounded-lg border border-border"
                  />
                )}
                {previewSrc && previewKind === "image" && (
                  <img src={previewSrc} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />
                )}
              </TabsContent>
              <TabsContent value="url" className="mt-3">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/archivo.jpg" />
                {previewSrc && previewKind === "video" && (
                  <video
                    src={previewSrc}
                    muted
                    loop
                    autoPlay
                    playsInline
                    controls
                    className="mt-3 w-32 h-32 object-cover rounded-lg border border-border"
                  />
                )}
                {previewSrc && previewKind === "image" && (
                  <img src={previewSrc} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Button onClick={handleAdd} disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Agregar categoría"}
          </Button>
        </div>

        <div className="bg-background rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Categorías existentes</h2>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : !categories?.length ? (
            <p className="text-muted-foreground text-sm">No hay categorías aún.</p>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((c: any) => (
                <div key={c.id} className="py-3 flex items-center gap-4">
                  {c.image_url ? (
                      getMediaKind(c.image_url) === "video" ? (
                        <video
                          src={c.image_url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
                        />
                      ) : (
                        <img src={c.image_url} alt={c.title} className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
                      )
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                      Sin img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{c.title}</p>
                    {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
