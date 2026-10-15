// Client Supabase (navigateur). Seules l'URL et la clé publique (anon) sont utilisées ici :
// la sécurité repose sur les règles d'accès par ligne de supabase/migrations, jamais sur le secret de cette clé.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Faux tant que les deux variables ne sont pas renseignées : l'application reste alors en mode local (localStorage). */
export const supabaseReady = !!url && !!key;

export const supabase = supabaseReady ? createClient(url!, key!) : null;
