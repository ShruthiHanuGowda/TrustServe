import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    RADIUS,
} from '../../constants/constants';

const { width, height } = Dimensions.get('window');

const WelcomeChoiceScreen = () => {
    const navigation = useNavigation<any>();

    const handleFindService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'CUSTOMER',
            selectedRole: 'CUSTOMER',
        });
    };

    const handleProvideService = () => {
        navigation.navigate('LoginScreen', {
            mode: 'PROVIDER',
            selectedRole: 'PROVIDER',
        });
    };

    const handleSignIn = () => {
        navigation.navigate('LoginScreen', {
            mode: 'SIGN_IN',
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
            />
            <View style={styles.container}>
                <Image
                    source={require('../../assets/logo-blue.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleFindService}
                        style={styles.option}
                    >
                        <View style={styles.iconContainer}>
                            <PersonIcon />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>
                                Royal Member
                            </Text>
                            <Text style={styles.optionDescription}>
                                Find the right service.
                                Book in minutes
                            </Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleProvideService}
                        style={styles.option}
                    >
                        <View style={styles.iconContainer}>
                            <BusinessIcon />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>
                               Service Partner
                            </Text>
                            <Text style={styles.optionDescription}>
                                Get discovered. Receive bookings
                            </Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>
                        Already have an account?
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSignIn}
                    >
                        <Text style={styles.signInLink}>
                            Sign in
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const PersonIcon = () => {
    return (
        <View style={styles.personIcon}>
            <View style={styles.personHead} />
            <View style={styles.personBody} />
        </View>
    );
};

const BusinessIcon = () => {
    return (
        <View style={styles.businessIcon}>
            <View style={styles.businessRoof} />
            <View style={styles.businessBuilding}>
                <View style={styles.businessDoor} />
                <View style={styles.businessWindow} />
                <View style={styles.businessWindow} />
            </View>
        </View>
    );
};

export default WelcomeChoiceScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: Math.max(
            SPACING.xxl,
            width * 0.08,
        ),
        paddingTop: height * 0.06,
    },
    logo: {
        width: 190,
        height: 70,
        alignSelf: 'center',
        marginTop: Math.max(
            SPACING.large,
            height * 0.025,
        ),
        marginBottom: Math.max(
            SPACING.xxxl,
            height * 0.025,
        ),
    },
    optionsContainer: {
        width: '100%',
    },
    option: {
        width: '100%',
        minHeight: Math.min(
            104,
            height * 0.135,
        ),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.medium,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.large,
        marginBottom: SPACING.medium,
    },
    iconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderStrong,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.background,
        marginRight: SPACING.large,
    },
    personIcon: {
        width: 25,
        height: 28,
        alignItems: 'center',
    },
    personHead: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.8,
        borderColor: COLORS.primary,
        marginBottom: 4,
    },
    personBody: {
        width: 22,
        height: 13,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderWidth: 1.8,
        borderBottomWidth: 0,
        borderColor: COLORS.primary,
    },
    businessIcon: {
        width: 25,
        height: 27,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    businessRoof: {
        width: 22,
        height: 6,
        borderWidth: 1.8,
        borderBottomWidth: 0,
        borderColor: COLORS.primary,
        transform: [{ rotate: '45deg' }],
        position: 'absolute',
        top: 1,
    },
    businessBuilding: {
        width: 22,
        height: 19,
        borderWidth: 1.8,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 2,
    },
    businessDoor: {
        width: 5,
        height: 9,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    businessWindow: {
        width: 4,
        height: 4,
        borderWidth: 1,
        borderColor: COLORS.primary,
        position: 'absolute',
        top: 5,
    },
    optionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: SPACING.small,
    },
    optionTitle: {
        fontFamily: FONTS.semiBold,
        fontSize: FONT_SIZES.medium,
        color: COLORS.primary,
    },
    optionDescription: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        color: COLORS.text,
    },
    arrow: {
        fontFamily: FONTS.regular,
        fontSize: 28,
        lineHeight: 30,
        color: COLORS.text,
        marginLeft: SPACING.small,
        includeFontPadding: false,
    },
    signInContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.medium,
    },
    signInText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.small,
        color: COLORS.text,
    },
    signInLink: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium,
        lineHeight: FONT_SIZES.small + 10,
        fontWeight: '600',
        color: COLORS.themeColor,
        marginLeft: 5,
        includeFontPadding: false,
    },
});