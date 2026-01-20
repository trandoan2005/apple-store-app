export const ModernTheme = {
    // Gradients
    gradientDeep: ['#0F172A', '#020617'] as const, // Extra dark for premium feel
    gradientHero: ['#1E293B', '#0F172A'] as const,
    gradientAccent: ['#E11D48', '#BE123C'] as const, // Rose/Crimson instead of generic red
    gradientDark: ['#020617', '#0F172A'] as const,
    gradientPrimary: ['#334155', '#1E293B'] as const,
    gradientWarm: ['#F59E0B', '#D97706'] as const,

    // Core Palette
    primary: '#0F172A',
    secondary: '#E11D48',  // Apple-like Rose/Red
    accent: '#38BDF8',     // Sky Blue for highlights
    danger: '#F43F5E',
    warning: '#F59E0B',
    success: '#10B981',

    // Neutral Colors
    background: '#020617',
    surface: 'rgba(255, 255, 255, 0.05)',
    card: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',

    // Typography
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    white: '#FFFFFF',

    // Spacing & Radius
    radiusLg: 32, // Softer corners
    radiusMd: 20,
    radiusSm: 12,

    // Fonts
    fontFamily: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
    },

    // Glass Effect Configuration
    glass: {
        intensity: 25,
        tint: 'dark',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    }
};
