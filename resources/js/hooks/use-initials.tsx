import { useCallback } from 'react';

export function useInitials() {
    return useCallback((fullName?: string | null): string => {
        // Validación defensiva: manejar undefined, null, o strings vacíos
        if (!fullName || typeof fullName !== 'string') {
            return '??'; // Fallback cuando no hay nombre
        }

        const trimmedName = fullName.trim();
        
        if (!trimmedName) {
            return '??'; // Fallback para strings vacíos después de trim
        }

        const names = trimmedName.split(' ').filter(name => name.length > 0);

        if (names.length === 0) return '??';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        const firstInitial = names[0].charAt(0);
        const lastInitial = names[names.length - 1].charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }, []);
}
