import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Pencil, Save, X } from "lucide-react";

interface CatalogItemAdminProps {
  item: {
    id: string;
    name: string;
    category: string;
  };
  onDelete: (id: string) => void;
}

const CatalogItemAdmin = ({ item, onDelete }: CatalogItemAdminProps) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);

  const startEdit = () => {
    setName(item.name);
    setCategory(item.category);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) {
      toast.error("Nombre y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("catalog_items")
        .update({ name: name.trim(), category: category.trim() })
        .eq("id", item.id);
      if (error) throw error;
      toast.success("Servicio actualizado");
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["catalog_items"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar";
      toast.error(msg.toLowerCase().includes("row-level security") ? "No tienes permisos." : msg);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="py-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Categoría</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)} size="sm" className="gap-1.5" disabled={saving}>
            <X className="h-3.5 w-3.5" /> Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
          {item.category}
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={startEdit} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive hover:text-destructive flex-shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CatalogItemAdmin;
