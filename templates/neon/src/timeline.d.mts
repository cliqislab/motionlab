// Tipos da timeline.mjs para o TypeScript.
export declare const FPS: number;
export declare const FORMATOS: Record<string, [number, number]>;
export declare const TIPOS: string[];
export type Cena = {
  i: number;
  tipo: string;
  inicio: number;
  fim: number;
  beats: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dados: any;
  impacto: boolean;
};
export type Eventos = {
  vo: number;
  duration: number;
  cuts: number[];
  shake: [number, number][];
  glitch: [number, number][];
  flash: [number, number][];
  k: Record<string, number>;
  music: Record<string, unknown>;
  sfx: { t: number; type: string; dur?: number; f?: number; amp?: number }[];
};
export type LinhaDoTempo = {
  formato: string;
  width: number;
  height: number;
  fps: number;
  vo: number;
  duracaoTotal: number;
  cenas: Cena[];
  eventos: Eventos;
  cores: { destaque: string; fundo: string; texto: string };
  efeitos: { hud: boolean; grao: boolean; grade: boolean };
  audio: boolean;
};
export declare function montarLinhaDoTempo(conteudo: unknown): LinhaDoTempo;
export declare function quantosElementos(c: unknown): number;
export declare function riscos(c: Cena): number[];
