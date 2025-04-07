import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    children: string;
}

export function Button({
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled,
    style,
    textStyle,
    children,
    ...props
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.text.inverse : colors.primary}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{children}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
    },
    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    // Text styles
    text: {
        textAlign: 'center',
        fontWeight: typography.weights.semibold as any,
    },
    primaryText: {
        color: colors.text.inverse,
    },
    secondaryText: {
        color: colors.text.inverse,
    },
    outlineText: {
        color: colors.primary,
    },
    ghostText: {
        color: colors.primary,
    },
    smallText: {
        fontSize: typography.sizes.sm,
    },
    mediumText: {
        fontSize: typography.sizes.md,
    },
    largeText: {
        fontSize: typography.sizes.lg,
    },
    // Disabled state
    disabled: {
        backgroundColor: colors.text.disabled,
        borderColor: colors.text.disabled,
    },
    disabledText: {
        color: colors.text.inverse,
    },
    container: {
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
}); 