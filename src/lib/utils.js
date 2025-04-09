
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ENCRYPTION_KEY = "paladium_cookie_clicker_2025";

export function encryptSave(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

export function decryptSave(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    throw new Error("Fichier de sauvegarde invalide ou corrompu");
  }
}

export function downloadSave(data, filename) {
  const encryptedData = encryptSave(data);
  const blob = new Blob([encryptedData], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function validateSaveFile(data) {
  const requiredKeys = ['cookies', 'upgrades', 'clickPower', 'autoClickPower', 'selectedBlock', 'critChance', 'critMultiplier'];
  return requiredKeys.every(key => key in data);
}
