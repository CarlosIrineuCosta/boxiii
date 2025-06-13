/// <reference types="vite/client" />

// Type declaration for Tailwind CSS v4 Vite plugin
declare module '@tailwindcss/vite' {
  import { Plugin } from 'vite';
  export default function tailwindcss(): Plugin;
}
