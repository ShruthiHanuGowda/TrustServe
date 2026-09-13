
import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/UserContext';
import {
    useMutation,
    useQuery,
} from '@apollo/client';
import {
    ADD_FAVORITE_SALON,
    REMOVE_FAVORITE_SALON,
    IS_FAVORITE_SALON,
} from '../../../graphql/queries';


// ============================================================
// COLORS
// ============================================================

const PRIMARY = '#009D94';

const COLORS = {
    black: '#111111',
    text: '#171717',
    secondary: '#6B6B6B',
    muted: '#969696',

    white: '#FFFFFF',

    border: '#EAEAEA',
    background: '#F8F8F8',

    greenLight: '#EAF7F2',
    green: '#16845F',

    redLight: '#FCEEEE',
    red: '#C43D3D',

    star: '#D99A22',
};


// ============================================================
// TYPES
// ============================================================

type BusinessDay = {
    open: string;
    close: string;
    isOpen: boolean;
};

type BusinessHours = {
    MONDAY: BusinessDay;
    TUESDAY: BusinessDay;
    WEDNESDAY: BusinessDay;
    THURSDAY: BusinessDay;
    FRIDAY: BusinessDay;
    SATURDAY: BusinessDay;
    SUNDAY: BusinessDay;
};

type SalonLogoMedia = {
    imageId?: string;
    salonId?: string;
    mediaType?: string;
    key?: string;
    objectUrl?: string | null;
    status?: string;
    uploadedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string | null;
    rejectedBy?: string | null;
    rejectionReason?: string | null;
};

type Props = {
    salon: {
        id: string;

        salonId?: string;

        name: string;

        rating: number;

        reviews?: number;

        distance: string;

        address?: {
            addressLine?: string;
            city?: string;
            state?: string;
            pincode?: string;
        };

        salonStatus?:
        | 'OPEN'
        | 'CLOSED'
        | 'TEMPORARILY_CLOSED';

        businessHours?: BusinessHours;

        categories?: string[];

        // ======================================================
        // APPROVED SALON LOGO
        // ======================================================
        //
        // This must come directly from GET_NEARBY_SALONS.
        //
        // IMPORTANT:
        // SalonCard intentionally does NOT use:
        //
        // salon.image
        // salon.logoUrl
        // salon.coverImageUrl
        //
        // Only logoMedia is used for the salon logo.
        //
        logoMedia?: SalonLogoMedia | null;
    };
};


// ============================================================
// GET CURRENT SALON STATUS
// ============================================================

const getSalonCurrentStatus = (
    salonStatus?:
        | 'OPEN'
        | 'CLOSED'
        | 'TEMPORARILY_CLOSED',

    businessHours?: BusinessHours,
) => {

    // ----------------------------------------------------------
    // TEMPORARILY CLOSED
    // ----------------------------------------------------------

    if (
        salonStatus ===
        'TEMPORARILY_CLOSED'
    ) {
        return {
            isOpen: false,
            text: 'Temporarily closed',
        };
    }


    // ----------------------------------------------------------
    // NO BUSINESS HOURS
    // ----------------------------------------------------------

    if (!businessHours) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }


    // ----------------------------------------------------------
    // CURRENT DAY
    // ----------------------------------------------------------

    const now = new Date();

    const days: Array<
        keyof BusinessHours
    > = [
            'SUNDAY',
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
        ];

    const today =
        days[now.getDay()];

    const todayHours =
        businessHours[today];


    if (
        !todayHours?.isOpen
    ) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }


    if (
        !todayHours.open ||
        !todayHours.close
    ) {
        return {
            isOpen: false,
            text: 'Closed',
        };
    }


    // ----------------------------------------------------------
    // TIME
    // ----------------------------------------------------------

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const [
        openHour,
        openMinute,
    ] =
        todayHours.open
            .split(':')
            .map(Number);


    const [
        closeHour,
        closeMinute,
    ] =
        todayHours.close
            .split(':')
            .map(Number);


    const openMinutes =
        openHour * 60 +
        openMinute;


    const closeMinutes =
        closeHour * 60 +
        closeMinute;


    let isOpen = false;


    // Normal opening hours
    if (
        closeMinutes >
        openMinutes
    ) {

        isOpen =
            currentMinutes >=
            openMinutes &&
            currentMinutes <
            closeMinutes;

    }

    // Overnight hours
    else if (
        closeMinutes <
        openMinutes
    ) {

        isOpen =
            currentMinutes >=
            openMinutes ||
            currentMinutes <
            closeMinutes;

    }


    return {
        isOpen,
        text:
            isOpen
                ? 'Open'
                : 'Closed',
    };
};


// ============================================================
// COMPONENT
// ============================================================

export default function SalonCard({
    salon,
}: Props) {

    const navigation =
        useNavigation<any>();


    const {
        currentUser,
    } = useUser();


    // ========================================================
    // SALON ID
    // ========================================================

    const salonId =
        salon.salonId ??
        salon.id;


    // ========================================================
    // APPROVED LOGO
    // ========================================================
    //
    // IMPORTANT:
    //
    // We ONLY use:
    //
    // salon.logoMedia.status
    // salon.logoMedia.objectUrl
    //
    // We deliberately DO NOT use:
    //
    // salon.image
    // salon.logoUrl
    // salon.coverImageUrl
    //
    // The Lambda generates a fresh signed URL from the
    // permanent S3 key every time nearbySalons() runs.
    //
    // ========================================================

    const approvedLogo =
        salon?.logoMedia?.status ===
            'APPROVED'
            ? (
                salon?.logoMedia?.objectUrl ??
                null
            )
            : null;


    console.log(
        '[SalonCard] Salon:',
        {
            salonId,
            name:
                salon?.name,

            logoMedia:
                salon?.logoMedia,

            logoStatus:
                salon?.logoMedia?.status,

            logoKey:
                salon?.logoMedia?.key,

            hasLogoUrl:
                Boolean(
                    salon?.logoMedia?.objectUrl,
                ),

            approvedLogo:
                Boolean(
                    approvedLogo,
                ),
        },
    );


    // ========================================================
    // LOGO ERROR STATE
    // ========================================================
    //
    // Signed S3 URLs can expire.
    //
    // If the approved logo URL cannot be loaded,
    // keep the image area blank instead of showing
    // another/fake image.
    //
    // ========================================================

    const [
        logoLoadFailed,
        setLogoLoadFailed,
    ] = React.useState(false);


    // ========================================================
    // RESET LOGO ERROR
    // ========================================================
    //
    // When Lambda returns a new signed URL, reset the
    // previous image error so the new URL gets another chance.
    //
    // ========================================================

    React.useEffect(() => {

        setLogoLoadFailed(false);

    }, [
        approvedLogo,
    ]);


    // ========================================================
    // FAVORITE STATE
    // ========================================================

    const [
        isFavorite,
        setIsFavorite,
    ] = React.useState(false);


    const [
        favoriteLoading,
        setFavoriteLoading,
    ] = React.useState(false);


    // ========================================================
    // FAVORITE STATUS
    // ========================================================

    const {
        data: favoriteData,

        loading:
        favoriteStatusLoading,

        refetch:
        refetchFavoriteStatus,

    } = useQuery(
        IS_FAVORITE_SALON,
        {
            variables: {
                userId:
                    currentUser?.userId ??
                    '',

                salonId,
            },

            skip:
                !currentUser?.userId ||
                !salonId,

            fetchPolicy:
                'network-only',

            notifyOnNetworkStatusChange:
                true,
        },
    );


    // ========================================================
    // SYNC FAVORITE
    // ========================================================

    React.useEffect(() => {

        if (
            favoriteData &&
            favoriteData.isFavoriteSalon !==
            undefined
        ) {

            setIsFavorite(
                favoriteData.isFavoriteSalon ===
                true,
            );

        }

    }, [
        favoriteData,
    ]);


    // ========================================================
    // MUTATIONS
    // ========================================================

    const [
        addFavorite,
    ] =
        useMutation(
            ADD_FAVORITE_SALON,
        );


    const [
        removeFavorite,
    ] =
        useMutation(
            REMOVE_FAVORITE_SALON,
        );


    // ========================================================
    // ADDRESS
    // ========================================================

    const address =
        [
            salon?.address?.addressLine,
            salon?.address?.city,
        ]
            .filter(Boolean)
            .join(', ');


    // ========================================================
    // STATUS
    // ========================================================

    const {
        isOpen,
        text: statusText,
    } =
        getSalonCurrentStatus(
            salon.salonStatus,
            salon.businessHours,
        );


    // ========================================================
    // CATEGORIES
    // ========================================================

    const categoryText =
        salon.categories &&
            salon.categories.length > 0
            ? salon.categories
                .slice(0, 2)
                .join('  •  ')
            : '';


    // ========================================================
    // OPEN SALON
    // ========================================================

    const handlePress =
        () => {

            navigation.navigate(
                'SalonDetails',
                {
                    salonId,
                    salon,
                },
            );

        };


    // ========================================================
    // FAVORITE
    // ========================================================

    const handleFavorite =
        async () => {

            if (
                !currentUser?.userId
            ) {

                console.log(
                    'User is not logged in',
                );

                return;
            }


            if (!salonId) {

                console.log(
                    'Salon ID is missing',
                );

                return;
            }


            if (
                favoriteLoading
            ) {
                return;
            }


            const previousState =
                isFavorite;


            try {

                setFavoriteLoading(
                    true,
                );


                // ------------------------------------------------
                // OPTIMISTIC UI
                // ------------------------------------------------

                setIsFavorite(
                    !previousState,
                );


                // ------------------------------------------------
                // REMOVE
                // ------------------------------------------------

                if (
                    previousState
                ) {

                    const {
                        data,
                    } =
                        await removeFavorite({
                            variables: {
                                input: {
                                    userId:
                                        currentUser.userId,

                                    salonId,
                                },
                            },
                        });


                    if (
                        !data
                            ?.removeFavoriteSalon
                            ?.success
                    ) {

                        setIsFavorite(
                            previousState,
                        );

                        console.log(
                            'Remove favorite failed:',
                            data
                                ?.removeFavoriteSalon
                                ?.message,
                        );
                    }

                }

                // ------------------------------------------------
                // ADD
                // ------------------------------------------------

                else {

                    const {
                        data,
                    } =
                        await addFavorite({
                            variables: {
                                input: {
                                    userId:
                                        currentUser.userId,

                                    salonId,
                                },
                            },
                        });


                    if (
                        !data
                            ?.addFavoriteSalon
                            ?.success
                    ) {

                        setIsFavorite(
                            previousState,
                        );

                        console.log(
                            'Add favorite failed:',
                            data
                                ?.addFavoriteSalon
                                ?.message,
                        );
                    }

                }


                // ------------------------------------------------
                // SYNC BACKEND
                // ------------------------------------------------

                await refetchFavoriteStatus();

            }

            catch (error) {

                console.error(
                    'Favorite salon error:',
                    error,
                );

                setIsFavorite(
                    previousState,
                );

            }

            finally {

                setFavoriteLoading(
                    false,
                );

            }

        };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <TouchableOpacity
            style={
                styles.card
            }
            activeOpacity={
                0.94
            }
            onPress={
                handlePress
            }
        >

            {/* ==================================================
                IMAGE
            ================================================== */}

            <View
                style={
                    styles.imageContainer
                }
            >

                {/* ==================================================
                    APPROVED LOGO ONLY
                ==================================================
                
                No fallback image is used.

                If:
                    - logoMedia is missing
                    - logoMedia is not APPROVED
                    - objectUrl is missing
                    - signed URL fails

                then the image area remains blank.
                ================================================== */}

                {!!approvedLogo &&
                    !logoLoadFailed ? (

                    <Image
                        source={{
                            uri: approvedLogo,
                        }}
                        style={styles.image}
                        resizeMode="cover"
                        onLoad={() => {
                            console.log(
                                '[SalonCard] ✅ LOGO LOADED:',
                                {
                                    salonId,
                                    logoUrl: approvedLogo,
                                },
                            );
                        }}
                        onLoadStart={() => {
                            console.log(
                                '[SalonCard] 🔄 LOGO LOAD START:',
                                salonId,
                            );
                        }}
                        onError={(error) => {

                            console.log(
                                '[SalonCard] ❌ LOGO LOAD FAILED:',
                                {
                                    salonId,
                                    error:
                                        error?.nativeEvent,
                                    url:
                                        approvedLogo,
                                },
                            );

                            setLogoLoadFailed(true);
                        }}
                    />

                ) : (

                    <View
                        style={
                            styles.image
                        }
                    />

                )}


                {/* ==================================================
                    FAVORITE
                ================================================== */}

                <TouchableOpacity
                    style={
                        styles.favoriteButton
                    }
                    activeOpacity={
                        0.8
                    }
                    disabled={
                        favoriteLoading ||
                        favoriteStatusLoading
                    }
                    onPress={
                        handleFavorite
                    }
                >

                    <Text
                        style={[
                            styles.heart,
                            isFavorite &&
                            styles.heartActive,
                        ]}
                    >
                        {isFavorite
                            ? '♥'
                            : '♡'}
                    </Text>

                </TouchableOpacity>

            </View>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <View
                style={
                    styles.content
                }
            >

                {/* ==================================================
                    NAME + STATUS
                ================================================== */}

                <View
                    style={
                        styles.nameRow
                    }
                >

                    <Text
                        style={
                            styles.name
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {salon.name}
                    </Text>


                    <View
                        style={[
                            styles.status,
                            isOpen
                                ? styles.statusOpen
                                : styles.statusClosed,
                        ]}
                    >

                        <View
                            style={[
                                styles.statusDot,
                                isOpen
                                    ? styles.dotOpen
                                    : styles.dotClosed,
                            ]}
                        />

                        <Text
                            style={[
                                styles.statusText,
                                isOpen
                                    ? styles.statusTextOpen
                                    : styles.statusTextClosed,
                            ]}
                        >
                            {statusText}
                        </Text>

                    </View>

                </View>


                {/* ==================================================
                    RATING + DISTANCE
                ================================================== */}

                <View
                    style={
                        styles.metaRow
                    }
                >

                    <View
                        style={
                            styles.ratingContainer
                        }
                    >

                        <Text
                            style={
                                styles.star
                            }
                        >
                            ★
                        </Text>

                        <Text
                            style={
                                styles.rating
                            }
                        >
                            {(
                                salon.rating ??
                                0
                            ).toFixed(1)}
                        </Text>


                        {salon.reviews !=
                            null && (
                                <Text
                                    style={
                                        styles.reviews
                                    }
                                >
                                    {salon.reviews}
                                    {' '}
                                    reviews
                                </Text>
                            )}

                    </View>


                    <View
                        style={
                            styles.separator
                        }
                    />


                    <Text
                        style={
                            styles.distance
                        }
                    >
                        {salon.distance}
                    </Text>

                </View>


                {/* ==================================================
                    ADDRESS
                ================================================== */}

                {!!address && (

                    <Text
                        style={
                            styles.address
                        }
                        numberOfLines={
                            1
                        }
                    >
                        📍 {address}
                    </Text>

                )}


                {/* ==================================================
                    CATEGORIES
                ================================================== */}

                {!!categoryText && (

                    <Text
                        style={
                            styles.categories
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {categoryText}
                    </Text>

                )}


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <View
                    style={
                        styles.footer
                    }
                >

                    <Text
                        style={
                            styles.viewText
                        }
                    >
                        View salon
                    </Text>

                    <Text
                        style={
                            styles.arrow
                        }
                    >
                        →
                    </Text>

                </View>

            </View>

        </TouchableOpacity>
    );
}


// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({

        // ======================================================
        // CARD
        // ======================================================

        card: {

            marginHorizontal:
                20,

            marginBottom:
                14,

            padding:
                10,

            backgroundColor:
                COLORS.white,

            borderRadius:
                18,

            flexDirection:
                'row',

            borderWidth:
                1,

            borderColor:
                COLORS.border,

            shadowColor:
                '#000',

            shadowOffset: {
                width: 0,
                height: 3,
            },

            shadowOpacity:
                0.045,

            shadowRadius:
                8,

            elevation:
                2,
        },


        // ======================================================
        // IMAGE
        // ======================================================

        imageContainer: {

            width:
                104,

            height:
                128,

            position:
                'relative',

            flexShrink:
                0,
        },


        image: {

            width:
                '100%',

            height:
                '100%',

            borderRadius:
                13,

            backgroundColor:
                COLORS.background,
        },


        // ======================================================
        // FAVORITE
        // ======================================================

        favoriteButton: {

            position:
                'absolute',

            top:
                7,

            right:
                7,

            width:
                20,

            height:
                20,

            borderRadius:
                15,

            backgroundColor:
                'rgba(255,255,255,0.96)',

            alignItems:
                'center',

            justifyContent:
                'center',

            shadowColor:
                '#000',

            shadowOffset: {
                width: 0,
                height: 1,
            },

            shadowOpacity:
                0.10,

            shadowRadius:
                3,

            elevation:
                2,
        },


        heart: {

            fontSize:
                12,

            color:
                '#333',

            lineHeight:
                20,

            fontWeight:
                '400',
        },


        heartActive: {

            color:
                '#D83A3A',

            fontWeight:
                '600',
        },


        // ======================================================
        // CONTENT
        // ======================================================

        content: {

            flex:
                1,

            marginLeft:
                13,

            paddingVertical:
                2,

            minWidth:
                0,
        },


        // ======================================================
        // NAME
        // ======================================================

        nameRow: {

            flexDirection:
                'row',

            alignItems:
                'center',

            width:
                '100%',
        },


        name: {

            flex:
                1,

            fontSize:
                16,

            lineHeight:
                20,

            fontWeight:
                '700',

            color:
                COLORS.text,

            marginRight:
                7,
        },


        // ======================================================
        // STATUS
        // ======================================================

        status: {

            flexDirection:
                'row',

            alignItems:
                'center',

            paddingHorizontal:
                7,

            paddingVertical:
                4,

            borderRadius:
                8,

            flexShrink:
                0,
        },


        statusOpen: {

            backgroundColor:
                COLORS.greenLight,
        },


        statusClosed: {

            backgroundColor:
                COLORS.redLight,
        },


        statusDot: {

            width:
                5,

            height:
                5,

            borderRadius:
                3,

            marginRight:
                4,
        },


        dotOpen: {

            backgroundColor:
                COLORS.green,
        },


        dotClosed: {

            backgroundColor:
                COLORS.red,
        },


        statusText: {

            fontSize:
                9,

            lineHeight:
                11,

            fontWeight:
                '600',
        },


        statusTextOpen: {

            color:
                COLORS.green,
        },


        statusTextClosed: {

            color:
                COLORS.red,
        },


        // ======================================================
        // META
        // ======================================================

        metaRow: {

            flexDirection:
                'row',

            alignItems:
                'center',

            marginTop:
                8,
        },


        ratingContainer: {

            flexDirection:
                'row',

            alignItems:
                'center',
        },


        star: {

            fontSize:
                12,

            color:
                COLORS.star,

            marginRight:
                3,
        },


        rating: {

            fontSize:
                12,

            fontWeight:
                '600',

            color:
                COLORS.text,
        },


        reviews: {

            marginLeft:
                4,

            fontSize:
                11,

            color:
                COLORS.muted,
        },


        separator: {

            width:
                3,

            height:
                3,

            borderRadius:
                2,

            backgroundColor:
                '#BDBDBD',

            marginHorizontal:
                9,
        },


        distance: {

            fontSize:
                11,

            color:
                PRIMARY,

            fontWeight:
                '600',
        },


        // ======================================================
        // ADDRESS
        // ======================================================

        address: {

            marginTop:
                7,

            fontSize:
                11,

            lineHeight:
                15,

            color:
                COLORS.secondary,
        },


        // ======================================================
        // CATEGORIES
        // ======================================================

        categories: {

            marginTop:
                5,

            fontSize:
                10,

            lineHeight:
                14,

            color:
                COLORS.muted,

            fontWeight:
                '500',
        },


        // ======================================================
        // FOOTER
        // ======================================================

        footer: {

            flexDirection:
                'row',

            alignItems:
                'center',

            marginTop:
                9,
        },


        viewText: {

            fontSize:
                12,

            color:
                PRIMARY,

            fontWeight:
                '600',
        },


        arrow: {

            marginLeft:
                5,

            fontSize:
                15,

            lineHeight:
                16,

            color:
                PRIMARY,

            fontWeight:
                '500',
        },

    });

