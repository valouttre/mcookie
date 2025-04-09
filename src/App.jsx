
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SaveLoadButtons } from "@/components/SaveLoadButtons";
import { BLOCKS } from "@/constants/blocks";
import { UPGRADES } from "@/constants/upgrades";

function App() {
  const { toast } = useToast();
  const [cookies, setCookies] = useState(0);
  const [upgrades, setUpgrades] = useState(() => 
    UPGRADES.map(upgrade => ({ ...upgrade, count: 0 }))
  );
  const [clickPower, setClickPower] = useState(1);
  const [autoClickPower, setAutoClickPower] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(BLOCKS[0]);
  const [critChance, setCritChance] = useState(0.05);
  const [critMultiplier, setCritMultiplier] = useState(2);
  const [goldenBlockChance, setGoldenBlockChance] = useState(0.01);
  const [showShop, setShowShop] = useState(false);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    const savedState = localStorage.getItem("cookieClickerState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        loadGameState(state);
      } catch (error) {
        console.error("Erreur lors du chargement de la sauvegarde:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cookieClickerState", JSON.stringify(getGameState()));
  }, [cookies, upgrades, clickPower, autoClickPower, selectedBlock, critChance, critMultiplier]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickPower > 0) {
        setCookies(prev => prev + autoClickPower);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoClickPower]);

  const getGameState = () => ({
    cookies,
    upgrades,
    clickPower,
    autoClickPower,
    selectedBlock,
    critChance,
    critMultiplier
  });

  const loadGameState = (state) => {
    setCookies(state.cookies);
    setUpgrades(state.upgrades);
    setClickPower(state.clickPower);
    setAutoClickPower(state.autoClickPower);
    setSelectedBlock(state.selectedBlock);
    setCritChance(state.critChance);
    setCritMultiplier(state.critMultiplier);
  };

  const handleClick = () => {
    const isCrit = Math.random() < critChance;
    const isGoldenBlock = Math.random() < goldenBlockChance;
    
    let clickValue = clickPower;
    
    if (isCrit) {
      clickValue *= critMultiplier;
      toast({
        title: "Coup Critique !",
        description: `+${clickValue} cookies !`,
        variant: "default"
      });
    }
    
    if (isGoldenBlock) {
      clickValue *= 10;
      toast({
        title: "Bloc Doré !",
        description: "x10 cookies !",
        variant: "default"
      });
    }
    
    setCookies(prev => prev + clickValue);
  };

  const handleImageError = (blockId) => {
    setImageError(prev => ({ ...prev, [blockId]: true }));
  };

  const getFallbackImage = (blockName) => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#8B4513"/>
        <text x="32" y="32" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dy=".3em">
          ${blockName}
        </text>
      </svg>
    `)}`;
  };

  const buyUpgrade = (upgrade) => {
  const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
    
    if (cookies >= cost) {
      setCookies(prev => prev - cost);
      setUpgrades(prev => prev.map(u => {
        if (u.id === upgrade.id) {
          const newCount = u.count + 1;
          if (newCount % 10 === 0) {
            setCritChance(prev => Math.min(prev + 0.01, 0.25));
            setCritMultiplier(prev => prev + 0.1);
            toast({
              title: "Niveau supérieur !",
              description: `Votre ${u.name} est maintenant niveau ${newCount/10} ! Chance de critique augmentée !`,
            });
          }
          return { ...u, count: newCount };
        }
        return u;
      }));
      setAutoClickPower(prev => prev + upgrade.multiplier);
    } else {
      toast({
        title: "Pas assez de cookies !",
        description: `Il vous manque ${cost - cookies} cookies pour acheter cet objet.`,
        variant: "destructive"
      });
    }
  };

  const buyBlock = (block) => {
    if (cookies >= block.cost) {
     setCookies(prev => prev - block.cost);
      setSelectedBlock(block);
      toast({
        title: "Bloc acheté !",
        description: `Vous avez acheté ${block.name} !`
      });
    } else {
      toast({
        title: "Pas assez de cookies !",
        description: `Il vous manque ${block.cost - cookies} cookies pour acheter ce bloc.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Mcookie</h1>
          <p className="text-2xl">Cookies: {Math.floor(cookies)}</p>
          <p className="text-lg">Par clic: {clickPower} (Critique: {(critChance * 100).toFixed(1)}%)</p>
          <p className="text-lg">Par seconde: {autoClickPower.toFixed(1)}</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={() => setShowShop(!showShop)}>
              {showShop ? "Fermer la Boutique" : "Ouvrir la Boutique"}
            </Button>
            <SaveLoadButtons
              gameState={getGameState()}
              onLoadSave={loadGameState}
              toast={toast}
            />
          </div>
        </div>

        {showShop ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {BLOCKS.map((block) => (
              <motion.div
                key={block.id}
                className={`bg-purple-800 p-4 rounded-lg cursor-pointer ${selectedBlock.id === block.id ? 'ring-2 ring-white' : ''}`}
                whileHover={{ scale: 1.05 }}
                onClick={() => buyBlock(block)}
              >
                <img 
                  src={imageError[block.id] ? getFallbackImage(block.name) : block.image} 
                  alt={block.name} 
                  className="w-16 h-16 mx-auto mb-2 pixelated"
                  onError={() => handleImageError(block.id)}
                />
                <h3 className="text-sm font-bold text-center">{block.name}</h3>
                <p className="text-xs text-center">{block.cost} cookies</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClick}
              className="cursor-pointer"
            >
              <img 
                src={imageError[selectedBlock.id] ? getFallbackImage(selectedBlock.name) : selectedBlock.image} 
                alt={selectedBlock.name} 
                className="w-48 h-48 pixelated"
                onError={() => handleImageError(selectedBlock.id)}
              />
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upgrades.map((upgrade) => {
            const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
            return (
              <motion.div
                key={upgrade.id}
                className="bg-purple-800 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{upgrade.icon}</span>
                  <span className="text-sm">Niveau {Math.floor(upgrade.count/10)}</span>
                </div>
                <h3 className="text-lg font-bold">{upgrade.name}</h3>
                <p className="text-sm mb-2">Quantité: {upgrade.count}</p>
                <p className="text-sm mb-2">Production: +{upgrade.multiplier} par seconde</p>
                <Button 
                  onClick={() => buyUpgrade(upgrade)}
                  disabled={cookies < cost}
                  className="w-full"
                  variant={cookies >= cost ? "default" : "secondary"}
                >
                  Acheter ({cost} cookies)
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
