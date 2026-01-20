import React from 'react';
import { Image, ImageProps, Platform, StyleSheet, ImageStyle, View } from 'react-native';

interface WebAwareImageProps extends ImageProps {
    style?: ImageStyle;
}

export const WebAwareImage: React.FC<WebAwareImageProps> = ({ source, style, resizeMode, ...props }) => {
    const uri = (source as any)?.uri;
    const [hasError, setHasError] = React.useState(false);

    if (Platform.OS === 'web' && uri) {
        const flatStyle = StyleSheet.flatten(style || {});
        const objectFit = resizeMode === 'contain' ? 'contain' : 'cover';

        if (hasError) {
            return (
                <View style={[style, styles.fallbackContainer]}>
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={{ width: '50%', height: '50%', opacity: 0.3 }}
                        tintColor="#fff"
                        resizeMode="contain"
                    />
                </View>
            );
        }

        return (
            <img
                src={uri}
                style={{
                    width: flatStyle.width,
                    height: flatStyle.height,
                    objectFit: objectFit as any,
                    borderRadius: flatStyle.borderRadius,
                    marginBottom: flatStyle.marginBottom,
                }}
                alt="Product"
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <Image
            source={source}
            style={style}
            resizeMode={resizeMode}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        overflow: 'hidden',
    }
});
