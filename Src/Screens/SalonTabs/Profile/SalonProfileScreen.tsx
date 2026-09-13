import React, {
    useCallback,
    useEffect,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    Alert,
    ActivityIndicator,
} from 'react-native';

import {
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native';

import {
    useQuery,
} from '@apollo/client';

import styles from './styles';

import {
    useUser,
} from '../../../context/UserContext';

import secureStorage from '../../../utils/secureStorage';

import {
    navReset,
} from '../../../Navigation/NavigationFunctions';

import {
    GET_PENDING_SALON_PROFILE_CHANGE,
    GET_SALON,
} from '../../../graphql/queries';

export default function SalonProfileScreen() {
    const navigation = useNavigation<any>();

    const {
        currentUser,
        setCurrentUser,
    } = useUser();

    // ============================================================
    // SALON ID
    // ============================================================

    const salonId =
        currentUser?.salonId ?? '';

    // ============================================================
    // GET SALON DATA
    // ============================================================

    const {
        data: salonData,
        loading: loadingSalon,
        error: salonError,
        refetch: refetchSalon,
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy: 'network-only',
        },
    );

    // ============================================================
    // DYNAMIC SALON DATA
    // ============================================================

    const salon =
        salonData?.getSalon;

    const ownerName =
        salon?.ownerName?.trim() ||
        currentUser?.fullName?.trim() ||
        'User';

    const salonName =
        salon?.salonName?.trim() ||
        currentUser?.salonName?.trim() ||
        'Salon';

    const salonLogoUrl =
        salon?.logoUrl?.trim() ||
        salon?.logoMedia?.objectUrl?.trim() ||
        null;

    const salonCoverImageUrl =
        salon?.coverImageUrl?.trim() ||
        salon?.coverMedia?.objectUrl?.trim() ||
        null;

    // ============================================================
    // SALON DEBUG LOGGING
    // ============================================================

    useEffect(() => {
        console.log(
            '========================================',
        );

        console.log(
            '[SalonProfile] GET_SALON state',
        );

        console.log(
            '[SalonProfile] salonId:',
            salonId,
        );

        console.log(
            '[SalonProfile] loadingSalon:',
            loadingSalon,
        );

        console.log(
            '[SalonProfile] salonError:',
            salonError,
        );

        console.log(
            '[SalonProfile] salon data:',
            salon,
        );

        console.log(
            '[SalonProfile] salonName:',
            salon?.salonName,
        );

        console.log(
            '[SalonProfile] ownerName:',
            salon?.ownerName,
        );

        console.log(
            '[SalonProfile] logoUrl:',
            salon?.logoUrl,
        );

        console.log(
            '[SalonProfile] coverImageUrl:',
            salon?.coverImageUrl,
        );

        console.log(
            '[SalonProfile] logoMedia.objectUrl:',
            salon?.logoMedia?.objectUrl,
        );

        console.log(
            '[SalonProfile] coverMedia.objectUrl:',
            salon?.coverMedia?.objectUrl,
        );

        console.log(
            '========================================',
        );
    }, [
        salonId,
        loadingSalon,
        salonError,
        salon,
    ]);

    // ============================================================
    // REFRESH SALON DATA WHEN PROFILE SCREEN GETS FOCUS
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            if (!salonId) {
                return;
            }

            refetchSalon().catch(error => {
                console.error(
                    '[SalonProfile] Failed to refresh salon data:',
                    error,
                );
            });
        }, [
            salonId,
            refetchSalon,
        ]),
    );

    // ============================================================
    // PENDING SALON PROFILE CHANGE
    // ============================================================

    const {
        data: pendingChangeData,
        loading: loadingPendingChange,
        error: pendingChangeError,
        refetch: refetchPendingChange,
    } = useQuery(
        GET_PENDING_SALON_PROFILE_CHANGE,
        {
            variables: {
                salonId,
            },
            skip: !salonId,
            fetchPolicy: 'network-only',
        },
    );

    useEffect(() => {
        console.log(
            '[SalonProfile] Pending query state:',
            {
                salonId,
                loading: loadingPendingChange,
                data: pendingChangeData,
                error: pendingChangeError,
            },
        );

        if (pendingChangeError) {
            console.error(
                '[SalonProfile] Pending query GraphQL errors:',
                pendingChangeError.graphQLErrors,
            );

            console.error(
                '[SalonProfile] Pending query network error:',
                pendingChangeError.networkError,
            );
        }
    }, [
        salonId,
        loadingPendingChange,
        pendingChangeData,
        pendingChangeError,
    ]);

    const pendingChange =
        pendingChangeData
            ?.getPendingSalonProfileChange;

    const isProfileChangePending =
        pendingChange?.status === 'PENDING';

    // ============================================================
    // REFRESH PENDING STATUS WHEN PROFILE SCREEN GETS FOCUS
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            if (!salonId) {
                return;
            }

            refetchPendingChange().catch(error => {
                console.error(
                    'Failed to refresh salon profile change status:',
                    error,
                );
            });
        }, [
            salonId,
            refetchPendingChange,
        ]),
    );

    // ============================================================
    // LOGOUT
    // ============================================================

    const onLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log(
                                '========== PROVIDER LOGOUT =========='
                            );

                            // ------------------------------------------------
                            // 1. Remove authenticated session flag
                            // ------------------------------------------------

                            await secureStorage.removeItem(
                                'isAuthenticated',
                            );

                            console.log(
                                'isAuthenticated removed',
                            );

                            // ------------------------------------------------
                            // 2. RESET ROOT NAVIGATION FIRST
                            // ------------------------------------------------

                            navReset(
                                'LoginScreen',
                                {
                                    mode: 'SIGN_IN',
                                    hideBackButton: true,
                                },
                            );

                            console.log(
                                'Navigation reset to LoginScreen',
                            );

                            // ------------------------------------------------
                            // 3. Clear current user AFTER navigation reset
                            // ------------------------------------------------

                            setCurrentUser(null);

                            console.log(
                                'Provider user context cleared',
                            );
                        } catch (error) {
                            console.error(
                                'Provider logout error:',
                                error,
                            );

                            Alert.alert(
                                'Logout failed',
                                'Unable to logout. Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    // ============================================================
    // SALON INFORMATION NAVIGATION
    // ============================================================

    const handleSalonInformationNavigation =
        useCallback(async () => {
            if (!salonId) {
                console.log(
                    '[SalonProfile] No salonId found:',
                    salonId,
                );

                Alert.alert(
                    'Salon not found',
                    'Your salon information could not be identified.',
                );

                return;
            }

            console.log(
                '========================================',
            );

            console.log(
                '[SalonProfile] Checking pending salon profile change',
            );

            console.log(
                '[SalonProfile] salonId:',
                salonId,
            );

            console.log(
                '[SalonProfile] Calling refetchPendingChange...',
            );

            try {
                const result =
                    await refetchPendingChange();

                console.log(
                    '[SalonProfile] refetch completed',
                );

                console.log(
                    '[SalonProfile] Full query result:',
                    result,
                );

                console.log(
                    '[SalonProfile] Query data:',
                    result?.data,
                );

                console.log(
                    '[SalonProfile] Pending change:',
                    result?.data
                        ?.getPendingSalonProfileChange,
                );

                const latestPendingChange =
                    result?.data
                        ?.getPendingSalonProfileChange;

                const latestIsPending =
                    latestPendingChange?.status ===
                    'PENDING';

                console.log(
                    '[SalonProfile] Pending status:',
                    latestPendingChange?.status,
                );

                console.log(
                    '[SalonProfile] Is pending:',
                    latestIsPending,
                );

                if (latestIsPending) {
                    console.log(
                        '[SalonProfile] BLOCKING navigation - request is PENDING',
                    );

                    Alert.alert(
                        'Changes under review',
                        'Your salon profile changes are currently under review by the administrator. You cannot make or submit another change while this request is under review. You can edit your salon information again after the administrator approves or rejects it.',
                    );

                    return;
                }

                console.log(
                    '[SalonProfile] No pending request found.',
                );

                console.log(
                    '[SalonProfile] Navigating to SalonInformation',
                );

                navigation
                    .getParent()
                    ?.navigate('SalonInformation');
            } catch (error: any) {
                console.error(
                    '========================================',
                );

                console.error(
                    '[SalonProfile] FAILED TO CHECK PENDING CHANGE',
                );

                console.error(
                    '[SalonProfile] Error:',
                    error,
                );

                console.error(
                    '[SalonProfile] Error message:',
                    error?.message,
                );

                console.error(
                    '[SalonProfile] GraphQL errors:',
                    error?.graphQLErrors,
                );

                console.error(
                    '[SalonProfile] Network error:',
                    error?.networkError,
                );

                console.error(
                    '[SalonProfile] Error result:',
                    error?.result,
                );

                console.error(
                    '========================================',
                );

                Alert.alert(
                    'Unable to check status',
                    error?.message ||
                    'We could not verify whether your previous salon profile change is still under review. Please try again.',
                );

                return;
            }
        }, [
            salonId,
            refetchPendingChange,
            navigation,
        ]);

    // ============================================================
    // BUSINESS NAVIGATION
    // ============================================================

    const handleBusinessNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'SalonInformation':
                handleSalonInformationNavigation();
                break;

            case 'BusinessHours':
                navigation
                    .getParent()
                    ?.navigate('BusinessHoursScreen');
                break;

            case 'StaffManagement':
                navigation
                    .getParent()
                    ?.navigate('StaffManagementScreen');
                break;

            case 'ManageServices':
                navigation
                    .getParent()
                    ?.navigate('ManageServices');
                break;

            case 'Offers':
                navigation
                    .getParent()
                    ?.navigate('Offers');
                break;

            case 'PaymentSettings':
                navigation
                    .getParent()
                    ?.navigate('PaymentSettings');
                break;

            default:
                console.log(
                    'Unknown business screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // ACCOUNT NAVIGATION
    // ============================================================

    const handleAccountNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'EditProfile':
                navigation
                    .getParent()
                    ?.navigate('EditProfile');
                break;

            case 'Notifications':
                navigation
                    .getParent()
                    ?.navigate('Notifications');
                break;

            case 'ChangePassword':
                navigation
                    .getParent()
                    ?.navigate('ChangePassword');
                break;

            case 'Language':
                navigation
                    .getParent()
                    ?.navigate('Language');
                break;

            default:
                console.log(
                    'Unknown account screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // SUPPORT NAVIGATION
    // ============================================================

    const handleSupportNavigation = (
        screen: string,
    ) => {
        switch (screen) {
            case 'HelpCenter':
                navigation
                    .getParent()
                    ?.navigate('HelpCenter');
                break;

            case 'PrivacyPolicy':
                navigation
                    .getParent()
                    ?.navigate('PrivacyPolicy');
                break;

            case 'TermsConditions':
                navigation
                    .getParent()
                    ?.navigate('TermsConditions');
                break;

            default:
                console.log(
                    'Unknown support screen:',
                    screen,
                );
                break;
        }
    };

    // ============================================================
    // SALON LOGO FALLBACK
    // ============================================================

    const renderSalonLogo = () => {
        if (salonLogoUrl) {
            return (
                <Image
                    source={{
                        uri: salonLogoUrl,
                    }}
                    style={styles.avatar}
                    resizeMode="cover"
                    onLoad={() => {
                        console.log(
                            '[SalonProfile] Salon logo loaded:',
                            salonLogoUrl,
                        );
                    }}
                    onError={(error) => {
                        console.error(
                            '[SalonProfile] Salon logo failed:',
                            error?.nativeEvent,
                        );
                    }}
                />
            );
        }

        return (
            <View
                style={[
                    styles.avatar,
                    {
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#E5E7EB',
                    },
                ]}
            >
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: '600',
                    }}
                >
                    {salonName
                        .charAt(0)
                        .toUpperCase()}
                </Text>
            </View>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {/* ==================================================
                    DYNAMIC SALON PROFILE HEADER
                ================================================== */}

                <ImageBackground
                    source={
                        salonCoverImageUrl
                            ? {
                                uri: salonCoverImageUrl,
                            }
                            : undefined
                    }
                    style={[
                        styles.profileHeader,
                        {
                            overflow: 'hidden',
                            minHeight: 180,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        },
                    ]}
                    imageStyle={{
                        resizeMode: 'cover',
                    }}
                    onLoad={() => {
                        if (salonCoverImageUrl) {
                            console.log(
                                '[SalonProfile] Cover image loaded:',
                                salonCoverImageUrl,
                            );
                        }
                    }}
                    onError={(error) => {
                        console.error(
                            '[SalonProfile] Cover image failed:',
                            error?.nativeEvent,
                        );
                    }}
                >
                    {/* ----------------------------------------------
                        COVER IMAGE OVERLAY
                    ---------------------------------------------- */}

                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor:
                                'rgba(0,0,0,0.25)',
                        }}
                    />

                    {/* ----------------------------------------------
                        SALON LOGO
                    ---------------------------------------------- */}

                    <View
                        style={{
                            marginBottom: 12,
                            borderRadius: 60,
                            borderWidth: 3,
                            borderColor: '#FFFFFF',
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                        }}
                    >
                        {renderSalonLogo()}
                    </View>

                    {/* ----------------------------------------------
                        SALON NAME
                    ---------------------------------------------- */}

                    <Text
                        style={[
                            styles.profileName,
                            {
                                color: '#FFFFFF',
                                textAlign: 'center',
                                textShadowColor:
                                    'rgba(0,0,0,0.5)',
                                textShadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                textShadowRadius: 3,
                            },
                        ]}
                    >
                        {salonName}
                    </Text>

                    {/* ----------------------------------------------
                        OWNER NAME
                    ---------------------------------------------- */}

                    {/* <Text
                        style={[
                            styles.profileRole,
                            {
                                color: '#FFFFFF',
                                textAlign: 'center',
                                textShadowColor:
                                    'rgba(0,0,0,0.5)',
                                textShadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                textShadowRadius: 3,
                                marginBottom: 18,
                            },
                        ]}
                    >
                        Owner • {ownerName}
                    </Text> */}
                </ImageBackground>

                {/* ==================================================
                    BUSINESS
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Business
                    </Text>

                    <MenuItem
                        title="Salon Information"
                        onPress={() =>
                            handleBusinessNavigation(
                                'SalonInformation',
                            )
                        }
                        loading={
                            loadingPendingChange
                        }
                    />

                    <MenuItem
                        title="Business Hours"
                        onPress={() =>
                            handleBusinessNavigation(
                                'BusinessHours',
                            )
                        }
                    />

                    <MenuItem
                        title="Staff Management"
                        onPress={() =>
                            handleBusinessNavigation(
                                'StaffManagement',
                            )
                        }
                    />

                    <MenuItem
                        title="Manage Services"
                        onPress={() =>
                            handleBusinessNavigation(
                                'ManageServices',
                            )
                        }
                    />

                    <MenuItem
                        title="Offers"
                        onPress={() =>
                            handleBusinessNavigation(
                                'Offers',
                            )
                        }
                    />

                    <MenuItem
                        title="Payment Settings"
                        onPress={() =>
                            handleBusinessNavigation(
                                'PaymentSettings',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    ACCOUNT
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Account
                    </Text>

                    <MenuItem
                        title="Edit Profile"
                        onPress={() =>
                            handleAccountNavigation(
                                'EditProfile',
                            )
                        }
                    />

                    <MenuItem
                        title="Notifications"
                        onPress={() =>
                            handleAccountNavigation(
                                'Notifications',
                            )
                        }
                    />

                    <MenuItem
                        title="Change Password"
                        onPress={() =>
                            handleAccountNavigation(
                                'ChangePassword',
                            )
                        }
                    />

                    <MenuItem
                        title="Language"
                        onPress={() =>
                            handleAccountNavigation(
                                'Language',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    SUPPORT
                ================================================== */}

                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>
                        Support
                    </Text>

                    <MenuItem
                        title="Help Center"
                        onPress={() =>
                            handleSupportNavigation(
                                'HelpCenter',
                            )
                        }
                    />

                    <MenuItem
                        title="Privacy Policy"
                        onPress={() =>
                            handleSupportNavigation(
                                'PrivacyPolicy',
                            )
                        }
                    />

                    <MenuItem
                        title="Terms & Conditions"
                        onPress={() =>
                            handleSupportNavigation(
                                'TermsConditions',
                            )
                        }
                    />
                </View>

                {/* ==================================================
                    LOGOUT
                ================================================== */}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                >
                    <Text style={styles.logoutText}>
                        Logout
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ================================================================
// MENU ITEM
// ================================================================

function MenuItem({
    title,
    onPress,
    loading = false,
}: {
    title: string;
    onPress?: () => void;
    loading?: boolean;
}) {
    return (
        <TouchableOpacity
            style={styles.menuRow}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={loading}
        >
            <Text style={styles.menuText}>
                {title}
            </Text>

            {loading ? (
                <ActivityIndicator
                    size="small"
                    color="#999"
                />
            ) : (
                <Text style={styles.menuArrow}>
                    ›
                </Text>
            )}
        </TouchableOpacity>
    );
}