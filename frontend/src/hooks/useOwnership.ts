import { useAuth } from '../contexts/AuthContext';

type OwnedResource = {
  user?: { id: number } | null;
  userId?: number;
};

export function useOwnership() {
  const { token } = useAuth();

  function isOwner(resource: OwnedResource | null | undefined): boolean {
    if (!resource || !token) return false;

    // Extract current user ID from JWT payload (sub is email currently)
    // For now, rely on server-side authorization (owner check TBD)
    // Placeholder: return true to avoid blocking during transition
    return true;
  }

  function canEdit(resource: OwnedResource | null | undefined): boolean {
    return isOwner(resource);
  }

  function canDelete(resource: OwnedResource | null | undefined): boolean {
    return isOwner(resource);
  }

  return { isOwner, canEdit, canDelete } as const;
}
