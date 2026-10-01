// This reference ensures TypeScript knows about Vite's environment variables
/// <reference types="vite/client" />

// Declare module for SVG imports
declare module '*.svg' {
  const content: any;
  export default content;
}
