import { useState } from "react";
import { useCategories } from "@/hooks/use-site-data";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
    setSaving(true);
    try {
      let finalUrl = "";
      if (imageMethod === "upload" && imageFile) {
        finalUrl = await uploadImage(imageFile);
      } else if (imageMethod === "url" && imageUrl.trim()) {
        finalUrl = imageUrl.trim();
      }

      const maxSort = categories?.reduce((max, c: any) => Math.max(max, c.sort_order || 0), 0) ?? 0;

      const { error } = await supabase.from("categories").insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: finalUrl || null,
        sort_order: maxSort + 1,
      });
      if (error) throw error;

      toast.success("Categoría agregada");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    toast.success("Categoría eliminada");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Administrar Productos</h1>
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
            <Label>Imagen</Label>
            <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="h-4 w-4" /> Subir archivo
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-1.5">
                  <Link className="h-4 w-4" /> URL de imagen
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-3">
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />
                )}
              </TabsContent>
              <TabsContent value="url" className="mt-3">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" />
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="mt-3 w-32 h-32 object-cover rounded-lg border border-border" />
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
                    <img src={c.image_url} alt={c.title} className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
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
