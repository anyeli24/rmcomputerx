import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Pencil, Save, X, Upload, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getMediaKind, isAcceptedCategoryMedia, CATEGORY_MEDIA_ACCEPT } from "@/lib/media";

interface CategoryItemProps {
  category: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
  };
  onDelete: (id: string) => void;
}

const CategoryItem = ({ category, onDelete }: CategoryItemProps) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description ?? "");
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState(category.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mediaKind = getMediaKind(category.image_url);

  const startEdit = () => {
    setTitle(category.title);
    setDescription(category.description ?? "");
    setImageUrl(category.image_url ?? "");
    setImageFile(null);
    setImagePreview(null);
    setImageMethod("upload");
    setEditing(true);
  };

  const cancelEdit = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedCategoryMedia(file)) {
      toast.error("Solo se permiten archivos .jpeg, .jpg, .png, .webp y .mp4");
      e.target.value = "";
      return;
    }
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      let finalUrl = category.image_url;

      if (imageMethod === "upload" && imageFile) {
        finalUrl = await uploadImage(imageFile);
      } else if (imageMethod === "url" && imageUrl.trim() !== (category.image_url ?? "")) {
        finalUrl = imageUrl.trim() || null;
      }

      const { error } = await supabase
        .from("categories")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          image_url: finalUrl,
        })
        .eq("id", category.id);

      if (error) throw error;

      toast.success("Categoría actualizada");
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar";
      if (msg.toLowerCase().includes("row-level security")) {
        toast.error("No tienes permisos. Inicia sesión de nuevo.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = imageMethod === "upload" ? imagePreview : imageUrl.trim();
  const previewKind = getMediaKind(previewSrc);

  if (editing) {
    return (
      <div className="py-4 space-y-3 border-b border-border last:border-b-0">
        <div className="space-y-2">
          <Label className="text-xs">Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Descripción</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Imagen / Video</Label>
          <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as "upload" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-1.5 text-xs"><Upload className="h-3 w-3" /> Subir</TabsTrigger>
              <TabsTrigger value="url" className="gap-1.5 text-xs"><Link className="h-3 w-3" /> URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-2">
              <Input type="file" accept={CATEGORY_MEDIA_ACCEPT} onChange={handleFileChange} />
              {previewSrc && previewKind === "video" && (
                <video src={previewSrc} muted loop autoPlay playsInline controls className="mt-2 w-24 h-24 object-cover rounded-lg border border-border" />
              )}
              {previewSrc && previewKind === "image" && (
                <img src={previewSrc} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-border" />
              )}
            </TabsContent>
            <TabsContent value="url" className="mt-2">
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              {previewSrc && previewKind === "video" && (
                <video src={previewSrc} muted loop autoPlay playsInline controls className="mt-2 w-24 h-24 object-cover rounded-lg border border-border" />
              )}
              {previewSrc && previewKind === "image" && (
                <img src={previewSrc} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg border border-border" />
              )}
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outline" onClick={cancelEdit} size="sm" className="gap-1.5" disabled={saving}>
            <X className="h-3.5 w-3.5" /> Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 flex items-center gap-4">
      {category.image_url ? (
        mediaKind === "video" ? (
          <video src={category.image_url} muted loop autoPlay playsInline className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
        ) : (
          <img src={category.image_url} alt={category.title} className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />
        )
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">Sin img</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{category.title}</p>
        {category.description && <p className="text-xs text-muted-foreground truncate">{category.description}</p>}
      </div>
      <Button variant="ghost" size="icon" onClick={startEdit} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)} className="text-destructive hover:text-destructive flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CategoryItem;
