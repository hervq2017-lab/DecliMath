-- Code famille : un seul code pour tous les enfants d'un parent.
-- Il sert de mot de passe aux comptes enfants (géré par le serveur, api/children.ts) ; la colonne permet de retrouver la famille à partir du code.
-- Aucun « grant update » : seul le serveur (clé service_role) l'écrit.
alter table public.profiles add column family_code text unique; -- parent
