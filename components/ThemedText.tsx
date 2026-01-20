import { Text, TextProps, StyleSheet } from 'react-native';
import { ModernTheme } from '../constants/ModernTheme';

export function ThemedText({ style, ...props }: TextProps) {
    // Flatten style to check for fontWeight
    const flatStyle = StyleSheet.flatten(style) || {};

    // Determine font family based on fontWeight
    let fontFamily = ModernTheme.fontFamily.regular;
    const { fontWeight } = flatStyle; // style has precedence

    if (fontWeight === '500' || fontWeight === 'medium') {
        fontFamily = ModernTheme.fontFamily.medium;
    } else if (fontWeight === '600' || fontWeight === 'semibold') {
        fontFamily = ModernTheme.fontFamily.semiBold;
    } else if (fontWeight === '700' || fontWeight === 'bold') {
        fontFamily = ModernTheme.fontFamily.bold;
    }

    // Remove fontWeight from style to let font-family take over (optional, but cleaner for some fonts)
    // For Inter, keeping fontWeight is usually fine, but specifying family is key.

    return (
        <Text
            style={[
                { fontFamily, color: ModernTheme.text },
                style,
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
});
