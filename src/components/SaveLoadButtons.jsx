
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { downloadSave, decryptSave, validateSaveFile } from "@/lib/utils";

export function SaveLoadButtons({ gameState, onLoadSave, toast }) {
  const fileInputRef = useRef(null);

  const handleSave = () => {
    try {
      downloadSave(gameState, 'paladium_cookie_save.mcookie');
      toast({
        title: "Sauvegarde réussie !",
        description: "Votre progression a été sauvegardée dans un fichier .mcookie"
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder votre progression",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const decryptedData = decryptSave(e.target.result);
        if (!validateSaveFile(decryptedData)) {
          throw new Error("Format de fichier invalide");
        }
        onLoadSave(decryptedData);
        toast({
          title: "Chargement réussi !",
          description: "Votre sauvegarde a été restaurée"
        });
      } catch (error) {
        toast({
          title: "Erreur de chargement",
          description: "Le fichier de sauvegarde est invalide ou corrompu",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleSave}>
        Sauvegarder
      </Button>
      <Button onClick={() => fileInputRef.current?.click()}>
        Charger une sauvegarde
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".mcookie"
        className="hidden"
      />
    </div>
  );
}
