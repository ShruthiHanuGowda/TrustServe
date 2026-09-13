import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    launchImageLibrary,
    ImagePickerResponse,
    Asset,
    ImageLibraryOptions,
} from 'react-native-image-picker';

import {
    useMutation,
    useQuery,
} from '@apollo/client';

import {
    useNavigation,
} from '@react-navigation/native';

import { useUser } from '../../../context/UserContext';

import {
    CREATE_SALON_MEDIA,
    DELETE_SALON_MEDIA,
    GENERATE_SALON_MEDIA_UPLOAD_URL,
    GET_PENDING_SALON_PROFILE_CHANGE,
    GET_SALON,
    UPDATE_SALON_PROFILE,
} from '../../../graphql/queries';

// ============================================================
// CONSTANTS
// ============================================================

const MAX_GALLERY_IMAGES = 6;

const MAX_FILE_SIZE_BYTES =
    10 * 1024 * 1024;

const DEFAULT_IMAGE_TYPE =
    'image/jpeg';

const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

// ============================================================
// TYPES
// ============================================================

type SalonAddress = {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
};

type SalonMedia = {
    imageId: string;
    salonId: string;
    mediaType: string;
    key: string;
    objectUrl?: string | null;
    status?: string | null;
    uploadedAt?: string | null;
    approvedAt?: string | null;
    approvedBy?: string | null;
    rejectedAt?: string | null;
    rejectedBy?: string | null;
    rejectionReason?: string | null;
};

type Salon = {
    salonId: string;
    ownerUserId: string;
    salonName: string;
    ownerName: string;
    businessType: string;
    ownerPhoneNumber: string;
    alternatePhone?: string | null;
    email: string;
    address: SalonAddress;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    galleryImages: string[];
    logoMedia?: SalonMedia | null;
    coverMedia?: SalonMedia | null;
    galleryMedia?: SalonMedia[] | null;
    kycStatus?: string;
    salonStatus?: string;
    isActive?: boolean;
    isVisible?: boolean;
    isDeleted?: boolean;
    averageRating?: number;
    totalReviews?: number;
    createdAt?: string;
    updatedAt?: string;
};

type ImageType =
    | 'logo'
    | 'cover'
    | 'gallery';

type GraphQLMediaType =
    | 'LOGO'
    | 'COVER'
    | 'GALLERY';

type MediaReference = {
    imageId: string;
    mediaType:
    | 'LOGO'
    | 'COVER'
    | 'GALLERY';
    key: string;
    objectUrl: string;

    /**
     * Local phone URI used only for an immediate
     * on-device preview.
     */
    previewUrl?: string;
};

type MediaChangedState = {
    logo: boolean;
    cover: boolean;
    gallery: boolean;
};

// ============================================================
// HELPERS
// ============================================================

const normalizeString = (
    value: unknown,
): string => {
    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }

    return String(value).trim();
};

// ============================================================
// CONTENT TYPE
// ============================================================

const getContentType = (
    asset: Asset,
): string => {
    const type =
        normalizeString(
            asset.type,
        ).toLowerCase();

    if (
        SUPPORTED_IMAGE_TYPES.includes(
            type,
        )
    ) {
        return type;
    }

    return DEFAULT_IMAGE_TYPE;
};

// ============================================================
// SUPPORTED IMAGE
// ============================================================

const isSupportedImage = (
    asset: Asset,
): boolean => {
    const type =
        normalizeString(
            asset.type,
        ).toLowerCase();

    /**
     * Some Android photo picker implementations can
     * return an asset without a MIME type.
     *
     * In that case we allow it and let the
     * server/S3 validation decide.
     */
    if (!type) {
        return true;
    }

    return SUPPORTED_IMAGE_TYPES.includes(
        type,
    );
};

// ============================================================
// GET S3 KEY FROM STORED URL
// ============================================================

const getS3KeyFromUrl = (
    value: string,
): string | null => {
    try {
        if (!value) {
            return null;
        }

        const parsed =
            new URL(value);

        const pathname =
            decodeURIComponent(
                parsed.pathname,
            );

        const key =
            pathname.replace(
                /^\/+/,
                '',
            );

        if (
            key.startsWith(
                'salons/',
            )
        ) {
            return key;
        }

        return null;
    } catch (error) {
        console.warn(
            'Unable to extract S3 key:',
            error,
        );

        return null;
    }
};

// ============================================================
// CONVERT SALON MEDIA TO REFERENCE
// ============================================================

const toMediaReference = (
    media: SalonMedia | null | undefined,
    fallbackType: 'LOGO' | 'COVER' | 'GALLERY',
    fallbackObjectUrl?: string | null,
): MediaReference | null => {
    const imageId = normalizeString(media?.imageId);
    const key =
        normalizeString(media?.key) ||
        getS3KeyFromUrl(normalizeString(fallbackObjectUrl));

    const objectUrl =
        normalizeString(media?.objectUrl) ||
        normalizeString(fallbackObjectUrl);

    if (!imageId || !key || !objectUrl) {
        return null;
    }

    return {
        imageId,
        mediaType: fallbackType,
        key,
        objectUrl,
        previewUrl: objectUrl,
    };
};

// ============================================================
// IMAGE UPLOAD
// ============================================================

async function uploadImageToS3(
    asset: Asset,
    salonId: string,
    mediaType: ImageType,
    generateUploadUrl: any,
): Promise<{
    imageId: string;
    objectUrl: string;
    key: string;
    mediaType:
    | 'LOGO'
    | 'COVER'
    | 'GALLERY';
}> {
    if (!salonId) {
        throw new Error(
            'Salon ID is missing.',
        );
    }

    if (!asset.uri) {
        throw new Error(
            'Selected image does not have a valid URI.',
        );
    }

    if (!isSupportedImage(asset)) {
        throw new Error(
            'Only JPEG, PNG and WebP images are supported.',
        );
    }

    if (
        asset.fileSize &&
        asset.fileSize >
        MAX_FILE_SIZE_BYTES
    ) {
        throw new Error(
            'Image size cannot exceed 10 MB.',
        );
    }

    const contentType =
        getContentType(asset);

    const graphqlMediaType =
        mediaType.toUpperCase() as
        | 'LOGO'
        | 'COVER'
        | 'GALLERY';

    console.log(
        '[SalonInformation] Requesting upload URL:',
        {
            salonId,
            mediaType:
                graphqlMediaType,
            contentType,
            fileSize:
                asset.fileSize,
            uri:
                asset.uri,
        },
    );

    const {
        data,
    } =
        await generateUploadUrl({
            variables: {
                input: {
                    salonId,

                    mediaType:
                        graphqlMediaType,

                    contentType,

                    fileSize:
                        asset.fileSize ||
                        undefined,
                },
            },
        });

    const response =
        data?.generateSalonMediaUploadUrl;

    console.log(
        '[SalonInformation] Upload URL response:',
        {
            success:
                response?.success,

            hasUploadUrl:
                !!response?.uploadUrl,

            hasObjectUrl:
                !!response?.objectUrl,

            hasKey:
                !!response?.key,

            hasImageId:
                !!response?.imageId,
        },
    );

    if (!response?.success) {
        throw new Error(
            response?.message ||
            'Unable to generate S3 upload URL.',
        );
    }

    if (!response.uploadUrl) {
        throw new Error(
            'S3 upload URL was not returned.',
        );
    }

    if (!response.objectUrl) {
        throw new Error(
            'S3 object URL was not returned.',
        );
    }

    if (!response.key) {
        throw new Error(
            'S3 object key was not returned.',
        );
    }

    if (!response.imageId) {
        throw new Error(
            'Image ID was not returned by the server.',
        );
    }

    // ========================================================
    // READ SELECTED PHONE IMAGE
    // ========================================================

    console.log(
        '[SalonInformation] Reading selected image:',
        asset.uri,
    );

    const localResponse =
        await fetch(
            asset.uri,
        );

    if (!localResponse.ok) {
        throw new Error(
            'Unable to read the selected image from the phone.',
        );
    }

    const blob =
        await localResponse.blob();

    // ========================================================
    // UPLOAD TO S3
    // ========================================================

    console.log(
        '[SalonInformation] Uploading image to S3:',
        response.key,
    );

    const uploadResponse =
        await fetch(
            response.uploadUrl,
            {
                method:
                    'PUT',

                headers: {
                    'Content-Type':
                        contentType,
                },

                body:
                    blob,
            },
        );

    if (!uploadResponse.ok) {
        const errorText =
            await uploadResponse
                .text()
                .catch(
                    () => '',
                );

        console.error(
            '[SalonInformation] S3 upload failed:',
            uploadResponse.status,
            errorText,
        );

        throw new Error(
            `Image upload failed (${uploadResponse.status}).`,
        );
    }

    console.log(
        '[SalonInformation] Image uploaded successfully:',
        {
            imageId:
                response.imageId,

            key:
                response.key,

            objectUrl:
                response.objectUrl,
        },
    );

    return {
        imageId:
            response.imageId,

        objectUrl:
            response.objectUrl,

        key:
            response.key,

        mediaType:
            graphqlMediaType,
    };
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function SalonInformation() {
    const navigation =
        useNavigation<any>();

    const {
        currentUser,
    } = useUser();

    const salonId =
        currentUser?.salonId ?? '';

    // ========================================================
    // SALON QUERY
    // ========================================================

    const {
        data,
        loading:
        loadingSalon,
        error:
        salonError,
    } = useQuery(
        GET_SALON,
        {
            variables: {
                salonId,
            },

            skip:
                !salonId,

            fetchPolicy:
                'network-only',
        },
    );

    const testImageUrl = async (url: any) => {
        if (!url) {
            console.log('[S3 TEST] No URL');
            return;
        }

        console.log('[S3 TEST] Starting request');

        try {
            const response = await fetch(url);

            console.log('[S3 TEST] HTTP status:', response.status);
            console.log('[S3 TEST] OK:', response.ok);
            console.log(
                '[S3 TEST] Content-Type:',
                response.headers.get('content-type'),
            );

            const blob = await response.blob();

            console.log('[S3 TEST] Blob size:', blob.size);
            console.log('[S3 TEST] Blob type:', blob.type);
        } catch (error) {
            console.error('[S3 TEST] FAILED:', error);
        }
    };
    useEffect(() => {
        if (data?.getSalon?.logoUrl) {
            console.log('[S3 TEST] Testing logo URL...');
            testImageUrl(data.getSalon.logoUrl);
        }
    }, [data]);
    // DEBUG LOG
    console.log('========== GET_SALON FRONTEND ==========');
    console.log('salonId:', salonId);
    console.log('loadingSalon:', loadingSalon);
    console.log('salonError:', salonError);
    console.log('hasData:', !!data);

    if (data?.getSalon) {
        console.log('salonName:', data.getSalon.salonName);
        console.log('logoUrl:', data.getSalon.logoUrl);
        console.log('coverImageUrl:', data.getSalon.coverImageUrl);
        console.log('galleryImages:', data.getSalon.galleryImages);

        console.log(
            'logoMedia.objectUrl:',
            data.getSalon.logoMedia?.objectUrl,
        );

        console.log(
            'coverMedia.objectUrl:',
            data.getSalon.coverMedia?.objectUrl,
        );

        console.log(
            'galleryMedia.objectUrls:',
            data.getSalon.galleryMedia?.map(
                (item: { objectUrl: any; }) => item?.objectUrl,
            ),
        );
    }

    console.log('========================================');
    // ========================================================
    // PENDING PROFILE CHANGE QUERY
    // ========================================================

    const {
        data:
        pendingChangeData,

        loading:
        loadingPendingChange,
    } = useQuery(
        GET_PENDING_SALON_PROFILE_CHANGE,
        {
            variables: {
                salonId,
            },

            skip:
                !salonId,

            fetchPolicy:
                'network-only',
        },
    );

    // ========================================================
    // MUTATIONS
    // ========================================================

    const [
        updateSalonProfile,
        {
            loading:
            updatingProfile,
        },
    ] = useMutation(
        UPDATE_SALON_PROFILE,
    );

    const [
        generateUploadUrl,
    ] = useMutation(
        GENERATE_SALON_MEDIA_UPLOAD_URL,
    );

    const [
        createSalonMedia,
    ] = useMutation(
        CREATE_SALON_MEDIA,
    );

    const [
        deleteSalonMedia,
    ] = useMutation(
        DELETE_SALON_MEDIA,
    );

    // ========================================================
    // FORM STATE
    // ========================================================

    const [
        salonName,
        setSalonName,
    ] = useState('');

    const [
        ownerName,
        setOwnerName,
    ] = useState('');

    const [
        businessType,
        setBusinessType,
    ] = useState('');

    const [
        email,
        setEmail,
    ] = useState('');

    const [
        phoneNumber,
        setPhoneNumber,
    ] = useState('');

    const [
        alternatePhone,
        setAlternatePhone,
    ] = useState('');

    const [
        addressLine,
        setAddressLine,
    ] = useState('');

    const [
        city,
        setCity,
    ] = useState('');

    const [
        state,
        setState,
    ] = useState('');

    const [
        pincode,
        setPincode,
    ] = useState('');

    const [
        logoUrl,
        setLogoUrl,
    ] = useState('');

    const [
        coverImageUrl,
        setCoverImageUrl,
    ] = useState('');

    const [
        galleryImages,
        setGalleryImages,
    ] = useState<string[]>(
        [],
    );

    // ========================================================
    // MEDIA REFERENCES
    // ========================================================

    const [
        logoMedia,
        setLogoMedia,
    ] = useState<
        MediaReference | null
    >(null);

    const [
        coverMedia,
        setCoverMedia,
    ] = useState<
        MediaReference | null
    >(null);

    const [
        galleryMedia,
        setGalleryMedia,
    ] = useState<
        MediaReference[]
    >([]);

    // ========================================================
    // MEDIA CHANGES
    // ========================================================

    const [
        mediaChanged,
        setMediaChanged,
    ] = useState<MediaChangedState>({
        logo:
            false,

        cover:
            false,

        gallery:
            false,
    });

    // ========================================================
    // NEWLY UPLOADED MEDIA
    // ========================================================

    const newlyUploadedMediaKeysRef =
        useRef<Set<string>>(
            new Set(),
        );

    // ========================================================
    // UI STATE
    // ========================================================

    const [
        savingImage,
        setSavingImage,
    ] = useState<
        ImageType | null
    >(null);

    const [
        removingGalleryIndex,
        setRemovingGalleryIndex,
    ] = useState<
        number | null
    >(null);

    // ========================================================
    // SUBMISSION LOCK
    // ========================================================

    /**
     * Local lock is kept so that immediately after a successful
     * submission the screen becomes locked without waiting for
     * another GraphQL request.
     *
     * The server-backed pending query below is the source of truth
     * when the screen is opened again.
     */
    const [
        submissionLocked,
        setSubmissionLocked,
    ] = useState(false);

    // ========================================================
    // SERVER PENDING STATUS
    // ========================================================

    const pendingChange =
        pendingChangeData
            ?.getPendingSalonProfileChange;

    const serverSubmissionLocked =
        pendingChange?.status ===
        'PENDING';

    const profileChangeLocked =
        submissionLocked ||
        serverSubmissionLocked;

    // ========================================================
    // INITIALIZE SUBMISSION LOCK
    // ========================================================

    useEffect(() => {
        /**
         * Only update the local lock when the server query has
         * actually returned data.
         *
         * While the query is loading, rendering is blocked below,
         * so the editable form cannot briefly flash before the
         * pending status is known.
         */
        if (
            loadingPendingChange
        ) {
            return;
        }

        setSubmissionLocked(
            serverSubmissionLocked,
        );
    }, [
        loadingPendingChange,
        serverSubmissionLocked,
    ]);

    // ========================================================
    // INITIALIZE FORM
    // ========================================================

    useEffect(() => {
        const salon:
            | Salon
            | undefined =
            data?.getSalon;

        if (!salon) {
            return;
        }
        console.log(
            '[SalonInformation] GET_SALON DATA:',
            JSON.stringify(
                {
                    salonId: salon.salonId,
                    salonName: salon.salonName,
                    logoUrl: salon.logoUrl,
                    coverImageUrl: salon.coverImageUrl,
                    galleryImages: salon.galleryImages,
                    logoMedia: salon.logoMedia,
                    coverMedia: salon.coverMedia,
                    galleryMedia: salon.galleryMedia,
                },
                null,
                2
            )
        );
        setSalonName(
            salon.salonName || '',
        );

        setOwnerName(
            salon.ownerName || '',
        );

        setBusinessType(
            salon.businessType || '',
        );

        setEmail(
            salon.email || '',
        );

        setPhoneNumber(
            salon.ownerPhoneNumber ||
            '',
        );

        setAlternatePhone(
            salon.alternatePhone ||
            '',
        );

        setAddressLine(
            salon.address
                ?.addressLine || '',
        );

        setCity(
            salon.address?.city ||
            '',
        );

        setState(
            salon.address?.state ||
            '',
        );

        setPincode(
            salon.address
                ?.pincode || '',
        );

        setLogoUrl(
            salon.logoUrl || '',
        );

        setCoverImageUrl(
            salon.coverImageUrl ||
            '',
        );

        const images =
            Array.isArray(
                salon.galleryImages,
            )
                ? salon.galleryImages
                : [];

        setGalleryImages(
            Array.from(
                new Set(
                    images.filter(
                        Boolean,
                    ),
                ),
            ).slice(
                0,
                MAX_GALLERY_IMAGES,
            ),
        );

        setLogoMedia(
            toMediaReference(
                salon.logoMedia,
                'LOGO',
                salon.logoUrl,
            ),
        );

        setCoverMedia(
            toMediaReference(
                salon.coverMedia,
                'COVER',
                salon.coverImageUrl,
            ),
        );

        const existingGalleryMedia =
            Array.isArray(
                salon.galleryMedia,
            )
                ? salon.galleryMedia
                : [];

        const validGalleryMedia =
            existingGalleryMedia
                .map(
                    media =>
                        toMediaReference(
                            media,
                            'GALLERY',
                        ),
                )
                .filter(
                    (
                        media,
                    ): media is MediaReference =>
                        !!media,
                )
                .slice(
                    0,
                    MAX_GALLERY_IMAGES,
                );

        setGalleryMedia(
            validGalleryMedia,
        );

        setMediaChanged({
            logo:
                false,

            cover:
                false,

            gallery:
                false,
        });

        newlyUploadedMediaKeysRef.current.clear();
    }, [data]);

    // ========================================================
    // QUERY ERROR
    // ========================================================

    useEffect(() => {
        if (!salonError) {
            return;
        }

        console.error(
            'Get salon error:',
            salonError,
        );

        Alert.alert(
            'Unable to load salon',
            salonError.message ||
            'Unable to load salon information.',
        );
    }, [salonError]);

    // ========================================================
    // SALON
    // ========================================================

    const salon:
        Salon | null =
        data?.getSalon || null;

    // ========================================================
    // VALIDATION
    // ========================================================

    const validateForm =
        useCallback(() => {
            if (!salonId) {
                Alert.alert(
                    'Salon not found',
                    'Your salon information could not be identified.',
                );

                return false;
            }

            if (
                !salonName.trim()
            ) {
                Alert.alert(
                    'Salon name required',
                    'Please enter your salon name.',
                );

                return false;
            }

            if (
                !ownerName.trim()
            ) {
                Alert.alert(
                    'Owner name required',
                    'Please enter the owner name.',
                );

                return false;
            }

            if (
                !businessType.trim()
            ) {
                Alert.alert(
                    'Business type required',
                    'Please enter the business type.',
                );

                return false;
            }

            if (
                !email.trim()
            ) {
                Alert.alert(
                    'Email required',
                    'Please enter your email address.',
                );

                return false;
            }

            if (
                !phoneNumber.trim()
            ) {
                Alert.alert(
                    'Phone number required',
                    'Please enter your phone number.',
                );

                return false;
            }

            if (
                !addressLine.trim()
            ) {
                Alert.alert(
                    'Address required',
                    'Please enter your address.',
                );

                return false;
            }

            if (!city.trim()) {
                Alert.alert(
                    'City required',
                    'Please enter your city.',
                );

                return false;
            }

            if (!state.trim()) {
                Alert.alert(
                    'State required',
                    'Please enter your state.',
                );

                return false;
            }

            if (!pincode.trim()) {
                Alert.alert(
                    'Pincode required',
                    'Please enter your pincode.',
                );

                return false;
            }

            if (
                galleryImages.length >
                MAX_GALLERY_IMAGES
            ) {
                Alert.alert(
                    'Gallery limit exceeded',
                    `You can have a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
                );

                return false;
            }

            return true;
        }, [
            salonId,
            salonName,
            ownerName,
            businessType,
            email,
            phoneNumber,
            addressLine,
            city,
            state,
            pincode,
            galleryImages.length,
        ]);

    // ========================================================
    // OPEN PHONE PHOTO PICKER
    // ========================================================

    const openPhonePhotoPicker =
        useCallback(
            async (
                mediaType: ImageType,
            ): Promise<ImagePickerResponse | null> => {
                try {
                    console.log(
                        '[SalonInformation] Opening native photo picker:',
                        {
                            platform:
                                Platform.OS,

                            androidVersion:
                                Platform.OS ===
                                    'android'
                                    ? Platform.Version
                                    : undefined,

                            mediaType,
                        },
                    );

                    const selectionLimit =
                        mediaType ===
                            'gallery'
                            ? Math.max(
                                1,
                                Math.min(
                                    MAX_GALLERY_IMAGES -
                                    galleryImages.length,
                                    MAX_GALLERY_IMAGES,
                                ),
                            )
                            : 1;

                    const options:
                        ImageLibraryOptions = {
                        mediaType:
                            'photo',

                        selectionLimit,

                        includeBase64:
                            false,

                        includeExtra:
                            false,

                        quality:
                            1,

                        ...(Platform.OS ===
                            'ios'
                            ? {
                                presentationStyle:
                                    'fullScreen',
                            }
                            : {}),
                    };

                    console.log(
                        '[SalonInformation] Photo picker options:',
                        options,
                    );

                    console.log(
                        '[SalonInformation] Calling launchImageLibrary...',
                    );

                    const result =
                        await launchImageLibrary(
                            options,
                        );

                    console.log(
                        '[SalonInformation] Native photo picker returned:',
                        {
                            didCancel:
                                result.didCancel,

                            errorCode:
                                result.errorCode,

                            errorMessage:
                                result.errorMessage,

                            assetCount:
                                result.assets
                                    ?.length ||
                                0,
                        },
                    );

                    return result;
                } catch (error) {
                    console.error(
                        '[SalonInformation] launchImageLibrary exception:',
                        error,
                    );

                    throw error;
                }
            },
            [
                galleryImages.length,
            ],
        );

    // ========================================================
    // CREATE PENDING MEDIA RECORD
    // ========================================================

    const createPendingMediaRecord =
        useCallback(
            async (
                uploaded: {
                    imageId: string;
                    objectUrl: string;
                    key: string;
                    mediaType: GraphQLMediaType;
                },
            ) => {
                console.log(
                    '[SalonInformation] Creating pending media record:',
                    {
                        salonId,

                        imageId:
                            uploaded.imageId,

                        mediaType:
                            uploaded.mediaType,

                        key:
                            uploaded.key,
                    },
                );

                try {
                    const {
                        data,
                    } =
                        await createSalonMedia({
                            variables: {
                                input: {
                                    salonId,

                                    imageId:
                                        uploaded.imageId,

                                    mediaType:
                                        uploaded.mediaType,

                                    key:
                                        uploaded.key,

                                    objectUrl:
                                        uploaded.objectUrl,
                                },
                            },
                        });

                    const response =
                        data?.createSalonMedia;

                    console.log(
                        '[SalonInformation] createSalonMedia response:',
                        {
                            success:
                                response?.success,

                            message:
                                response?.message,

                            imageId:
                                response?.media?.imageId,

                            status:
                                response?.media?.status,
                        },
                    );

                    if (
                        !response?.success
                    ) {
                        throw new Error(
                            response?.message ||
                            'Unable to create salon media approval request.',
                        );
                    }

                    if (
                        !response.media
                    ) {
                        throw new Error(
                            'Salon media approval record was not returned.',
                        );
                    }

                    return response.media;
                } catch (error) {
                    console.error(
                        '[SalonInformation] createSalonMedia failed:',
                        error,
                    );

                    /**
                     * S3 upload already succeeded.
                     *
                     * Remove the uploaded object/media record so
                     * we don't leave an orphaned image when the
                     * pending media record cannot be created.
                     */
                    try {
                        console.log(
                            '[SalonInformation] Cleaning up S3 upload after createSalonMedia failure:',
                            uploaded.key,
                        );

                        await deleteSalonMedia({
                            variables: {
                                input: {
                                    salonId,

                                    key:
                                        uploaded.key,
                                },
                            },
                        });

                        console.log(
                            '[SalonInformation] Failed media upload cleanup completed:',
                            uploaded.key,
                        );
                    } catch (
                    cleanupError
                    ) {
                        console.warn(
                            '[SalonInformation] Failed media cleanup:',
                            cleanupError,
                        );
                    }

                    throw error;
                }
            },
            [
                salonId,
                createSalonMedia,
                deleteSalonMedia,
            ],
        );

    // ========================================================
    // PICK + UPLOAD IMAGE
    // ========================================================

    const pickImage =
        useCallback(
            async (
                mediaType: ImageType,
            ) => {
                /**
                 * Extra client-side protection.
                 *
                 * The UI is already disabled when a profile request
                 * is pending, but this also protects the callback
                 * itself.
                 */
                if (
                    profileChangeLocked
                ) {
                    Alert.alert(
                        'Changes under review',
                        'You cannot change your salon information while the current request is under review. You can make another change after the administrator approves or rejects it.',
                    );

                    return;
                }

                if (
                    savingImage
                ) {
                    return;
                }

                if (!salonId) {
                    Alert.alert(
                        'Salon not found',
                        'Your salon information could not be identified.',
                    );

                    return;
                }

                if (
                    mediaType ===
                    'gallery' &&
                    galleryImages.length >=
                    MAX_GALLERY_IMAGES
                ) {
                    Alert.alert(
                        'Gallery full',
                        `You can add a maximum of ${MAX_GALLERY_IMAGES} gallery images.`,
                    );

                    return;
                }

                const previousLogoUrl =
                    logoUrl;

                const previousCoverImageUrl =
                    coverImageUrl;

                const previousLogoMedia =
                    logoMedia;

                const previousCoverMedia =
                    coverMedia;

                try {
                    setSavingImage(
                        mediaType,
                    );

                    // ==================================================
                    // OPEN NATIVE PHOTO PICKER
                    // ==================================================

                    const result =
                        await openPhonePhotoPicker(
                            mediaType,
                        );

                    if (!result) {
                        return;
                    }

                    if (
                        result.didCancel
                    ) {
                        console.log(
                            '[SalonInformation] User cancelled photo picker.',
                        );

                        return;
                    }

                    if (
                        result.errorCode
                    ) {
                        console.error(
                            '[SalonInformation] Photo picker error:',
                            {
                                errorCode:
                                    result.errorCode,

                                errorMessage:
                                    result.errorMessage,
                            },
                        );

                        Alert.alert(
                            'Image selection failed',
                            result.errorMessage ||
                            `Unable to open/select photos (${result.errorCode}).`,
                        );

                        return;
                    }

                    const assets =
                        result.assets ||
                        [];

                    console.log(
                        '[SalonInformation] Selected assets:',
                        assets.map(
                            asset => ({
                                uri:
                                    asset.uri,

                                type:
                                    asset.type,

                                fileName:
                                    asset.fileName,

                                fileSize:
                                    asset.fileSize,

                                width:
                                    asset.width,

                                height:
                                    asset.height,
                            }),
                        ),
                    );

                    if (
                        assets.length ===
                        0
                    ) {
                        Alert.alert(
                            'No photo selected',
                            'Please select a photo from your phone gallery.',
                        );

                        return;
                    }

                    // ==================================================
                    // GALLERY
                    // ==================================================

                    if (
                        mediaType ===
                        'gallery'
                    ) {
                        const remaining =
                            MAX_GALLERY_IMAGES -
                            galleryImages.length;

                        const selectedAssets =
                            assets.slice(
                                0,
                                remaining,
                            );

                        const selectedAssetsWithUris =
                            selectedAssets.filter(
                                asset =>
                                    !!asset.uri,
                            );

                        if (
                            selectedAssetsWithUris.length ===
                            0
                        ) {
                            Alert.alert(
                                'Invalid photo',
                                'The selected photo does not have a usable phone URI.',
                            );

                            return;
                        }

                        /**
                         * Show the phone images immediately.
                         * The local URI is only a UI preview;
                         * the backend still receives the real
                         * S3 objectUrl after upload.
                         */
                        const localPreviewUris =
                            selectedAssetsWithUris
                                .map(
                                    asset =>
                                        asset.uri as string,
                                )
                                .filter(
                                    (
                                        uri,
                                        index,
                                        all,
                                    ) =>
                                        all.indexOf(
                                            uri,
                                        ) ===
                                        index,
                                );

                        setGalleryImages(
                            previous =>
                                Array.from(
                                    new Set([
                                        ...previous,
                                        ...localPreviewUris,
                                    ]),
                                ).slice(
                                    0,
                                    MAX_GALLERY_IMAGES,
                                ),
                        );

                        const uploadedMedia:
                            MediaReference[] =
                            [];

                        for (
                            const asset of selectedAssetsWithUris
                        ) {
                            const localPreviewUri =
                                asset.uri as string;

                            try {
                                // --------------------------------------
                                // S3 UPLOAD
                                // --------------------------------------

                                const uploaded =
                                    await uploadImageToS3(
                                        asset,
                                        salonId,
                                        'gallery',
                                        generateUploadUrl,
                                    );

                                /**
                                 * Keep track of this key so that if
                                 * the salon removes the image before
                                 * saving, deleteSalonMedia can clean it.
                                 */
                                newlyUploadedMediaKeysRef.current.add(
                                    uploaded.key,
                                );

                                // --------------------------------------
                                // CREATE PENDING MEDIA
                                // --------------------------------------

                                await createPendingMediaRecord(
                                    uploaded,
                                );

                                /**
                                 * Keep the local URI for the preview.
                                 */
                                uploadedMedia.push({
                                    imageId:
                                        uploaded.imageId,

                                    mediaType:
                                        'GALLERY',

                                    key:
                                        uploaded.key,

                                    objectUrl:
                                        uploaded.objectUrl,

                                    previewUrl:
                                        localPreviewUri,
                                });

                                console.log(
                                    '[SalonInformation] Gallery media is now PENDING:',
                                    {
                                        imageId:
                                            uploaded.imageId,

                                        key:
                                            uploaded.key,

                                        previewUri:
                                            localPreviewUri,

                                        objectUrl:
                                            uploaded.objectUrl,
                                    },
                                );
                            } catch (
                            uploadError
                            ) {
                                console.error(
                                    '[SalonInformation] Gallery upload/create error:',
                                    uploadError,
                                );

                                // Remove only the failed local preview.
                                setGalleryImages(
                                    previous =>
                                        previous.filter(
                                            image =>
                                                image !==
                                                localPreviewUri,
                                        ),
                                );

                                Alert.alert(
                                    'Image upload failed',
                                    uploadError instanceof
                                        Error
                                        ? uploadError.message
                                        : 'Unable to upload image.',
                                );

                                break;
                            }
                        }

                        if (
                            uploadedMedia.length >
                            0
                        ) {
                            setGalleryMedia(
                                previous => {
                                    const existingIds =
                                        new Set(
                                            previous.map(
                                                media =>
                                                    media.imageId,
                                            ),
                                        );

                                    const newMedia =
                                        uploadedMedia.filter(
                                            media =>
                                                !existingIds.has(
                                                    media.imageId,
                                                ),
                                        );

                                    return [
                                        ...previous,
                                        ...newMedia,
                                    ].slice(
                                        0,
                                        MAX_GALLERY_IMAGES,
                                    );
                                },
                            );

                            setMediaChanged(
                                previous => ({
                                    ...previous,

                                    gallery:
                                        true,
                                }),
                            );
                        }

                        return;
                    }

                    // ==================================================
                    // LOGO / COVER
                    // ==================================================

                    const asset =
                        assets[0];

                    if (!asset) {
                        return;
                    }

                    /**
                     * Show the selected phone image immediately.
                     */
                    if (asset.uri) {
                        if (
                            mediaType ===
                            'logo'
                        ) {
                            setLogoUrl(
                                asset.uri,
                            );
                        } else {
                            setCoverImageUrl(
                                asset.uri,
                            );
                        }
                    }

                    // ----------------------------------------------
                    // S3 UPLOAD
                    // ----------------------------------------------

                    const uploaded =
                        await uploadImageToS3(
                            asset,
                            salonId,
                            mediaType,
                            generateUploadUrl,
                        );

                    /**
                     * Track the uploaded object before creating
                     * the pending record so cleanup is possible.
                     */
                    newlyUploadedMediaKeysRef.current.add(
                        uploaded.key,
                    );

                    // ----------------------------------------------
                    // CREATE PENDING MEDIA
                    // ----------------------------------------------

                    await createPendingMediaRecord(
                        uploaded,
                    );

                    const reference:
                        MediaReference = {
                        imageId:
                            uploaded.imageId,

                        mediaType:
                            mediaType ===
                                'logo'
                                ? 'LOGO'
                                : 'COVER',

                        key:
                            uploaded.key,

                        objectUrl:
                            uploaded.objectUrl,

                        previewUrl:
                            asset.uri,
                    };

                    console.log(
                        '[SalonInformation] Media is now PENDING:',
                        {
                            imageId:
                                uploaded.imageId,

                            key:
                                uploaded.key,

                            mediaType:
                                uploaded.mediaType,
                        },
                    );

                    // ==================================================
                    // LOGO
                    // ==================================================

                    if (
                        mediaType ===
                        'logo'
                    ) {
                        setLogoUrl(
                            asset.uri ||
                            uploaded.objectUrl,
                        );

                        setLogoMedia(
                            reference,
                        );

                        setMediaChanged(
                            previous => ({
                                ...previous,

                                logo:
                                    true,
                            }),
                        );
                    }

                    // ==================================================
                    // COVER
                    // ==================================================

                    if (
                        mediaType ===
                        'cover'
                    ) {
                        setCoverImageUrl(
                            asset.uri ||
                            uploaded.objectUrl,
                        );

                        setCoverMedia(
                            reference,
                        );

                        setMediaChanged(
                            previous => ({
                                ...previous,

                                cover:
                                    true,
                            }),
                        );
                    }
                } catch (error) {
                    console.error(
                        '[SalonInformation] Image picker/upload error:',
                        error,
                    );

                    /**
                     * If logo/cover upload fails, restore the previous
                     * working image instead of leaving the local preview
                     * pointing at an image that was never uploaded.
                     */
                    if (
                        mediaType ===
                        'logo'
                    ) {
                        setLogoUrl(
                            previousLogoUrl,
                        );

                        setLogoMedia(
                            previousLogoMedia,
                        );
                    } else if (
                        mediaType ===
                        'cover'
                    ) {
                        setCoverImageUrl(
                            previousCoverImageUrl,
                        );

                        setCoverMedia(
                            previousCoverMedia,
                        );
                    }

                    Alert.alert(
                        'Upload failed',
                        error instanceof
                            Error
                            ? error.message
                            : 'Unable to select or upload image.',
                    );
                } finally {
                    setSavingImage(
                        null,
                    );
                }
            },
            [
                profileChangeLocked,
                savingImage,
                salonId,
                galleryImages,
                openPhonePhotoPicker,
                generateUploadUrl,
                createPendingMediaRecord,
                logoUrl,
                coverImageUrl,
                logoMedia,
                coverMedia,
            ],
        );

    // ========================================================
    // REMOVE GALLERY IMAGE
    // ========================================================

    const removeGalleryImage =
        useCallback(
            (
                index: number,
            ) => {
                if (
                    profileChangeLocked
                ) {
                    Alert.alert(
                        'Changes under review',
                        'You cannot change your salon information while the current request is under review. You can make another change after the administrator approves or rejects it.',
                    );

                    return;
                }

                const image =
                    galleryImages[
                    index
                    ];

                if (!image) {
                    return;
                }

                Alert.alert(
                    'Remove image',
                    'Are you sure you want to remove this gallery image?',
                    [
                        {
                            text:
                                'Cancel',

                            style:
                                'cancel',
                        },

                        {
                            text:
                                'Remove',

                            style:
                                'destructive',

                            onPress:
                                async () => {
                                    try {
                                        setRemovingGalleryIndex(
                                            index,
                                        );

                                        const media =
                                            galleryMedia.find(
                                                item =>
                                                    item.objectUrl ===
                                                    image ||
                                                    item.previewUrl ===
                                                    image,
                                            );

                                        /**
                                         * Only physically delete media
                                         * that was uploaded during this
                                         * current editing session.
                                         *
                                         * Existing approved media is NOT
                                         * physically deleted here.
                                         */
                                        if (
                                            media &&
                                            newlyUploadedMediaKeysRef
                                                .current
                                                .has(
                                                    media.key,
                                                )
                                        ) {
                                            try {
                                                const {
                                                    data:
                                                    deleteData,
                                                } =
                                                    await deleteSalonMedia(
                                                        {
                                                            variables:
                                                            {
                                                                input:
                                                                {
                                                                    salonId,

                                                                    key:
                                                                        media.key,
                                                                },
                                                            },
                                                        },
                                                    );

                                                const deleteResponse =
                                                    deleteData
                                                        ?.deleteSalonMedia;

                                                if (
                                                    !deleteResponse?.success
                                                ) {
                                                    console.warn(
                                                        'Unable to clean up newly uploaded image:',
                                                        deleteResponse?.message,
                                                    );
                                                } else {
                                                    console.log(
                                                        '[SalonInformation] Newly uploaded gallery media deleted:',
                                                        media.key,
                                                    );
                                                }
                                            } catch (
                                            cleanupError
                                            ) {
                                                console.warn(
                                                    'New image cleanup failed:',
                                                    cleanupError,
                                                );
                                            }

                                            newlyUploadedMediaKeysRef
                                                .current
                                                .delete(
                                                    media.key,
                                                );
                                        }

                                        setGalleryImages(
                                            previous =>
                                                previous.filter(
                                                    (
                                                        _,
                                                        imageIndex,
                                                    ) =>
                                                        imageIndex !==
                                                        index,
                                                ),
                                        );

                                        if (
                                            media
                                        ) {
                                            setGalleryMedia(
                                                previous =>
                                                    previous.filter(
                                                        item =>
                                                            item.imageId !==
                                                            media.imageId,
                                                    ),
                                            );
                                        }

                                        setMediaChanged(
                                            previous => ({
                                                ...previous,

                                                gallery:
                                                    true,
                                            }),
                                        );

                                        Alert.alert(
                                            'Image removed',
                                            'The gallery change will be submitted for admin approval when you save your profile.',
                                        );
                                    } catch (
                                    error
                                    ) {
                                        console.error(
                                            'Remove gallery image error:',
                                            error,
                                        );

                                        Alert.alert(
                                            'Unable to remove image',
                                            error instanceof
                                                Error
                                                ? error.message
                                                : 'Please try again.',
                                        );
                                    } finally {
                                        setRemovingGalleryIndex(
                                            null,
                                        );
                                    }
                                },
                        },
                    ],
                );
            },
            [
                profileChangeLocked,
                galleryImages,
                galleryMedia,
                salonId,
                deleteSalonMedia,
            ],
        );

    // ========================================================
    // SAVE PROFILE
    // ========================================================

    const handleSave =
        useCallback(
            async () => {
                if (
                    updatingProfile
                ) {
                    return;
                }

                /**
                 * Protect the save callback itself in addition
                 * to disabling the button.
                 */
                if (
                    profileChangeLocked
                ) {
                    Alert.alert(
                        'Changes under review',
                        'You cannot update your salon information while the current request is under review. You can make another change after the administrator approves or rejects it.',
                    );

                    return;
                }

                if (!salonId) {
                    Alert.alert(
                        'Salon not found',
                        'Your salon information could not be identified.',
                    );

                    return;
                }

                if (
                    !validateForm()
                ) {
                    return;
                }

                const confirmed =
                    await new Promise<boolean>(
                        resolve => {
                            Alert.alert(
                                'Submit changes for approval?',
                                'Once you submit these changes, you will not be able to update your salon information while this request is under review. You can make another change after the administrator approves or rejects it.',
                                [
                                    {
                                        text:
                                            'Cancel',

                                        style:
                                            'cancel',

                                        onPress:
                                            () =>
                                                resolve(
                                                    false,
                                                ),
                                    },

                                    {
                                        text:
                                            'Submit for Approval',

                                        onPress:
                                            () =>
                                                resolve(
                                                    true,
                                                ),
                                    },
                                ],
                                {
                                    cancelable:
                                        false,
                                },
                            );
                        },
                    );

                if (!confirmed) {
                    return;
                }

                try {
                    const input: any = {
                        salonId,

                        salonName:
                            salonName.trim(),

                        ownerName:
                            ownerName.trim(),

                        businessType:
                            businessType.trim(),

                        email:
                            email.trim(),

                        ownerPhoneNumber:
                            phoneNumber.trim(),

                        alternatePhone:
                            alternatePhone.trim() ||
                            null,

                        address: {
                            addressLine:
                                addressLine.trim(),

                            city:
                                city.trim(),

                            state:
                                state.trim(),

                            pincode:
                                pincode.trim(),
                        },

                        logoUrl:
                            logoUrl ||
                            null,

                        coverImageUrl:
                            coverImageUrl ||
                            null,

                        galleryImages:
                            galleryImages,
                    };

                    // ====================================================
                    // LOGO MEDIA
                    // ====================================================

                    if (
                        mediaChanged.logo
                    ) {
                        input.logoUrl =
                            logoMedia?.objectUrl ||
                            null;

                        input.logoMedia =
                            logoMedia
                                ? {
                                    imageId:
                                        logoMedia.imageId,

                                    mediaType:
                                        logoMedia.mediaType,

                                    key:
                                        logoMedia.key,

                                    objectUrl:
                                        logoMedia.objectUrl,
                                }
                                : null;
                    }

                    // ====================================================
                    // COVER MEDIA
                    // ====================================================

                    if (
                        mediaChanged.cover
                    ) {
                        input.coverImageUrl =
                            coverMedia?.objectUrl ||
                            null;

                        input.coverMedia =
                            coverMedia
                                ? {
                                    imageId:
                                        coverMedia.imageId,

                                    mediaType:
                                        coverMedia.mediaType,

                                    key:
                                        coverMedia.key,

                                    objectUrl:
                                        coverMedia.objectUrl,
                                }
                                : null;
                    }

                    // ====================================================
                    // GALLERY MEDIA
                    // ====================================================

                    if (
                        mediaChanged.gallery
                    ) {
                        /**
                         * galleryImages is the display state and may
                         * contain local phone URIs for newly selected
                         * photos.
                         *
                         * Never send those local URIs to the API.
                         */
                        input.galleryImages =
                            galleryMedia
                                .map(
                                    media =>
                                        media.objectUrl,
                                )
                                .filter(
                                    Boolean,
                                );

                        input.galleryMedia =
                            galleryMedia.map(
                                media => ({
                                    imageId:
                                        media.imageId,

                                    mediaType:
                                        media.mediaType,

                                    key:
                                        media.key,

                                    objectUrl:
                                        media.objectUrl,
                                }),
                            );
                    }

                    console.log(
                        '[SalonInformation] Submitting profile:',
                        {
                            salonId,

                            hasLogoMedia:
                                !!input.logoMedia,

                            hasCoverMedia:
                                !!input.coverMedia,

                            galleryCount:
                                galleryImages.length,

                            galleryMediaCount:
                                input.galleryMedia
                                    ?.length ??
                                'unchanged',

                            mediaChanged,
                        },
                    );

                    const {
                        data:
                        mutationData,
                    } =
                        await updateSalonProfile(
                            {
                                variables: {
                                    input,
                                },
                            },
                        );

                    const response =
                        mutationData
                            ?.updateSalonProfile;

                    if (
                        !response?.success
                    ) {
                        throw new Error(
                            response?.message ||
                            'Unable to update salon profile.',
                        );
                    }

                    /**
                     * Do not refetch immediately after saving.
                     * Pending media may intentionally be excluded
                     * from the customer-facing gallery until approval.
                     */
                    newlyUploadedMediaKeysRef
                        .current
                        .clear();

                    setMediaChanged({
                        logo:
                            false,

                        cover:
                            false,

                        gallery:
                            false,
                    });

                    /**
                     * Lock immediately after successful submission.
                     * The server-backed pending query will also
                     * return PENDING on the next screen load.
                     */
                    setSubmissionLocked(
                        true,
                    );

                    Alert.alert(
                        'Changes submitted',
                        'Your changes have been submitted for admin approval. You cannot make another change while this request is under review. You can edit your salon information again after the administrator approves or rejects it.',
                    );
                } catch (
                error
                ) {
                    console.error(
                        'Update salon profile error:',
                        error,
                    );

                    Alert.alert(
                        'Update failed',
                        error instanceof
                            Error
                            ? error.message
                            : 'Unable to update salon information.',
                    );
                }
            },
            [
                updatingProfile,
                profileChangeLocked,
                validateForm,
                updateSalonProfile,
                salonId,
                salonName,
                ownerName,
                businessType,
                email,
                phoneNumber,
                alternatePhone,
                addressLine,
                city,
                state,
                pincode,
                logoUrl,
                coverImageUrl,
                galleryImages,
                logoMedia,
                coverMedia,
                galleryMedia,
                mediaChanged,
            ],
        );

    // ========================================================
    // HEADER TITLE
    // ========================================================

    const screenTitle =
        useMemo(
            () =>
                salon?.salonName ||
                'Salon Information',
            [salon],
        );

    // ========================================================
    // NO SALON
    // ========================================================

    if (!salonId) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.centerContainer
                    }
                >
                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        Salon not found
                    </Text>

                    <Text
                        style={
                            styles.errorMessage
                        }
                    >
                        Your provider account is not
                        currently linked to a salon.
                    </Text>

                    <TouchableOpacity
                        style={
                            styles.secondaryButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Text
                            style={
                                styles.secondaryButtonText
                            }
                        >
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ========================================================
    // LOADING
    // ========================================================

    /**
     * IMPORTANT:
     *
     * We also wait for the pending-change query.
     *
     * This prevents the editable Salon Information screen
     * from briefly appearing while the app is still checking
     * whether an existing request is PENDING.
     */
    if (
        loadingSalon ||
        loadingPendingChange
    ) {
        return (
            <SafeAreaView
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.centerContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            stylesVars.primary
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Checking salon information...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <KeyboardAvoidingView
                style={
                    styles.flex
                }
                behavior={
                    Platform.OS ===
                        'ios'
                        ? 'padding'
                        : undefined
                }
            >
                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <View
                    style={
                        styles.header
                    }
                >
                    <TouchableOpacity
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Text
                            style={
                                styles.backIcon
                            }
                        >
                            ‹
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={
                            styles.headerTitle
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {screenTitle}
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.scrollContent
                    }
                >
                    {/* ================================================= */}
                    {/* BASIC INFORMATION */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Basic Information
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Update the information customers see
                            about your salon.
                        </Text>

                        <InputField
                            label="Salon Name"
                            value={
                                salonName
                            }
                            onChangeText={
                                setSalonName
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter salon name"
                        />

                        <InputField
                            label="Owner Name"
                            value={
                                ownerName
                            }
                            onChangeText={
                                setOwnerName
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter owner name"
                        />

                        <InputField
                            label="Business Type"
                            value={
                                businessType
                            }
                            onChangeText={
                                setBusinessType
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="e.g. Salon, Beauty Parlour"
                        />

                        <InputField
                            label="Email"
                            value={
                                email
                            }
                            onChangeText={
                                setEmail
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <InputField
                            label="Phone Number"
                            value={
                                phoneNumber
                            }
                            onChangeText={
                                setPhoneNumber
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />

                        <InputField
                            label="Alternate Phone"
                            value={
                                alternatePhone
                            }
                            onChangeText={
                                setAlternatePhone
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Optional alternate phone"
                            keyboardType="phone-pad"
                            optional
                        />
                    </View>

                    {/* ================================================= */}
                    {/* ADDRESS */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Salon Address
                        </Text>

                        <InputField
                            label="Address"
                            value={
                                addressLine
                            }
                            onChangeText={
                                setAddressLine
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter full address"
                            multiline
                        />

                        <InputField
                            label="City"
                            value={
                                city
                            }
                            onChangeText={
                                setCity
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter city"
                        />

                        <InputField
                            label="State"
                            value={
                                state
                            }
                            onChangeText={
                                setState
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter state"
                        />

                        <InputField
                            label="Pincode"
                            value={
                                pincode
                            }
                            onChangeText={
                                setPincode
                            }
                            disabled={
                                profileChangeLocked
                            }
                            placeholder="Enter pincode"
                            keyboardType="number-pad"
                            maxLength={
                                6
                            }
                        />
                    </View>

                    {/* ================================================= */}
                    {/* PROFILE PHOTO */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Salon Profile Photo
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Choose a photo directly from your
                            phone. Photo changes require admin
                            approval.
                        </Text>

                        <View
                            style={
                                styles.logoRow
                            }
                        >
                            <View style={styles.logoPreview}>
                                {logoUrl ? (
                                    <Image
                                        source={{ uri: logoUrl }}
                                        style={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 60,
                                        }}
                                        resizeMode="contain"
                                        onLoad={() =>
                                            console.log('[IMAGE] ===== LOGO LOADED =====')
                                        }
                                        onError={e =>
                                            console.log(
                                                '[IMAGE] ===== LOGO ERROR =====',
                                                e.nativeEvent,
                                            )
                                        }
                                    />
                                ) : (
                                    <Text style={styles.logoPlaceholder}>
                                        {getInitials(salonName)}
                                    </Text>
                                )}
                            </View>
                            <View
                                style={
                                    styles.logoActions
                                }
                            >
                                <TouchableOpacity
                                    style={
                                        styles.outlineButton
                                    }
                                    onPress={() =>
                                        pickImage(
                                            'logo',
                                        )
                                    }
                                    disabled={
                                        !!savingImage ||
                                        profileChangeLocked
                                    }
                                >
                                    {savingImage ===
                                        'logo' ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={
                                                stylesVars.primary
                                            }
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.outlineButtonText
                                            }
                                        >
                                            {logoUrl
                                                ? 'Change Photo'
                                                : 'Choose Photo'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <Text
                                    style={
                                        styles.imageHint
                                    }
                                >
                                    Opens your phone photo picker •
                                    JPEG, PNG or WebP • Max 10 MB
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* ================================================= */}
                    {/* COVER */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Cover Photo
                        </Text>

                        <Text
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            Choose a banner image directly from
                            your phone. Cover photo changes require
                            admin approval.
                        </Text>

                        <View
                            style={
                                styles.coverContainer
                            }
                        >
                            {coverImageUrl ? (
                                <Image
                                    source={{
                                        uri:
                                            coverImageUrl,
                                    }}
                                    style={
                                        styles.coverImage
                                    }
                                    onLoad={() => console.log('[IMAGE] LOGO LOADED')}
                                    onError={(e) =>
                                        console.log('[IMAGE] LOGO ERROR:', e.nativeEvent)
                                    }
                                />
                            ) : (
                                <View
                                    style={
                                        styles.coverPlaceholder
                                    }
                                >
                                    <Text
                                        style={
                                            styles.coverPlaceholderText
                                        }
                                    >
                                        No cover photo
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={
                                    styles.coverButton
                                }
                                onPress={() =>
                                    pickImage(
                                        'cover',
                                    )
                                }
                                disabled={
                                    !!savingImage ||
                                    profileChangeLocked
                                }
                            >
                                {savingImage ===
                                    'cover' ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#FFFFFF"
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.coverButtonText
                                        }
                                    >
                                        {coverImageUrl
                                            ? 'Change Cover'
                                            : 'Choose Cover'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ================================================= */}
                    {/* GALLERY */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <View
                            style={
                                styles.galleryHeader
                            }
                        >
                            <View
                                style={
                                    styles.galleryTitleContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Gallery
                                </Text>

                                <Text
                                    style={
                                        styles.sectionSubtitle
                                    }
                                >
                                    Select photos directly from
                                    your phone to showcase your
                                    salon and work. Gallery changes
                                    require admin approval.
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.galleryCount
                                }
                            >
                                {galleryImages.length} /{' '}
                                {
                                    MAX_GALLERY_IMAGES
                                }
                            </Text>
                        </View>

                        {galleryImages.length ===
                            0 ? (
                            <View
                                style={
                                    styles.emptyGallery
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyGalleryIcon
                                    }
                                >
                                    +
                                </Text>

                                <Text
                                    style={
                                        styles.emptyGalleryTitle
                                    }
                                >
                                    No gallery images
                                </Text>

                                <Text
                                    style={
                                        styles.emptyGalleryText
                                    }
                                >
                                    Add photos from your phone to
                                    help customers discover your
                                    salon.
                                </Text>
                            </View>
                        ) : (
                            <View
                                style={
                                    styles.galleryGrid
                                }
                            >
                                {galleryImages.map(
                                    (
                                        image,
                                        index,
                                    ) => (
                                        <View
                                            key={`${image}-${index}`}
                                            style={
                                                styles.galleryItem
                                            }
                                        >
                                            <Image
                                                source={{
                                                    uri:
                                                        image,
                                                }}
                                                style={
                                                    styles.galleryImage
                                                }
                                                onLoad={() => console.log('[IMAGE] LOGO LOADED')}
                                                onError={(e) =>
                                                    console.log('[IMAGE] LOGO ERROR:', e.nativeEvent)
                                                }
                                            />

                                            <Pressable
                                                style={
                                                    styles.removeGalleryButton
                                                }
                                                onPress={() =>
                                                    removeGalleryImage(
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    profileChangeLocked ||
                                                    removingGalleryIndex ===
                                                    index
                                                }
                                            >
                                                {removingGalleryIndex ===
                                                    index ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color="#FFFFFF"
                                                    />
                                                ) : (
                                                    <Text
                                                        style={
                                                            styles.removeGalleryText
                                                        }
                                                    >
                                                        ×
                                                    </Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    ),
                                )}
                            </View>
                        )}

                        {galleryImages.length <
                            MAX_GALLERY_IMAGES && (
                                <TouchableOpacity
                                    style={
                                        styles.addGalleryButton
                                    }
                                    onPress={() =>
                                        pickImage(
                                            'gallery',
                                        )
                                    }
                                    disabled={
                                        !!savingImage ||
                                        profileChangeLocked
                                    }
                                >
                                    {savingImage ===
                                        'gallery' ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={
                                                stylesVars.primary
                                            }
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.addGalleryButtonText
                                            }
                                        >
                                            + Choose Photos from Phone
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}

                        <Text
                            style={
                                styles.imageHint
                            }
                        >
                            Select multiple photos at once • Up to{' '}
                            {
                                MAX_GALLERY_IMAGES
                            } images • Max 10 MB each
                        </Text>
                    </View>

                    {/* ================================================= */}
                    {/* APPROVAL INFORMATION */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.infoCard
                        }
                    >
                        <Text
                            style={
                                styles.infoTitle
                            }
                        >
                            Photo approval
                        </Text>

                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            Photos selected from your phone are
                            uploaded securely and submitted for
                            separate media approval. Your existing
                            customer-facing photos remain unchanged
                            until the administrator approves the
                            uploaded media.
                        </Text>
                    </View>

                    {/* ================================================= */}
                    {/* PROTECTED INFORMATION */}
                    {/* ================================================= */}

                    <View
                        style={
                            styles.infoCard
                        }
                    >
                        <Text
                            style={
                                styles.infoTitle
                            }
                        >
                            Verification information
                        </Text>

                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            KYC, GST, PAN, Aadhaar, bank details,
                            approval status and salon status are
                            managed separately and cannot be changed
                            from Salon Information.
                        </Text>
                    </View>

                    {/* ================================================= */}
                    {/* SUBMISSION LOCK */}
                    {/* ================================================= */}

                    {profileChangeLocked && (
                        <View
                            style={
                                styles.lockedCard
                            }
                        >
                            <Text
                                style={
                                    styles.lockedTitle
                                }
                            >
                                Changes awaiting admin review
                            </Text>

                            <Text
                                style={
                                    styles.lockedText
                                }
                            >
                                You cannot make or submit another
                                change while the current request is
                                under review. You can edit your salon
                                information again after the
                                administrator approves or rejects it.
                            </Text>
                        </View>
                    )}

                    {/* ================================================= */}
                    {/* SAVE */}
                    {/* ================================================= */}

                    <TouchableOpacity
                        style={[
                            styles.saveButton,

                            (
                                updatingProfile ||
                                profileChangeLocked
                            ) &&
                            styles.saveButtonDisabled,
                        ]}
                        onPress={
                            handleSave
                        }
                        disabled={
                            updatingProfile ||
                            !!savingImage ||
                            profileChangeLocked
                        }
                    >
                        {updatingProfile ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />

                                <Text
                                    style={
                                        styles.saveButtonText
                                    }
                                >
                                    Submitting...
                                </Text>
                            </>
                        ) : profileChangeLocked ? (
                            <Text
                                style={
                                    styles.saveButtonText
                                }
                            >
                                Awaiting Admin Review
                            </Text>
                        ) : (
                            <Text
                                style={
                                    styles.saveButtonText
                                }
                            >
                                Submit Changes for Approval
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View
                        style={{
                            height: 40,
                        }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ============================================================
// INPUT COMPONENT
// ============================================================

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    multiline,
    maxLength,
    autoCapitalize,
    optional,
    disabled,
}: {
    label: string;
    value: string;
    onChangeText: (
        value: string,
    ) => void;
    placeholder: string;
    keyboardType?: any;
    multiline?: boolean;
    maxLength?: number;
    autoCapitalize?: any;
    optional?: boolean;
    disabled?: boolean;
}) {
    return (
        <View
            style={
                styles.inputContainer
            }
        >
            <View
                style={
                    styles.inputLabelRow
                }
            >
                <Text
                    style={
                        styles.inputLabel
                    }
                >
                    {label}
                </Text>

                {optional && (
                    <Text
                        style={
                            styles.optionalText
                        }
                    >
                        Optional
                    </Text>
                )}
            </View>

            <TextInput
                value={
                    value
                }
                onChangeText={
                    onChangeText
                }
                placeholder={
                    placeholder
                }
                placeholderTextColor={
                    stylesVars.placeholder
                }
                keyboardType={
                    keyboardType
                }
                multiline={
                    multiline
                }
                maxLength={
                    maxLength
                }
                autoCapitalize={
                    autoCapitalize ||
                    'sentences'
                }
                editable={
                    !disabled
                }
                style={[
                    styles.input,

                    multiline &&
                    styles.multilineInput,
                ]}
                textAlignVertical={
                    multiline
                        ? 'top'
                        : 'center'
                }
            />
        </View>
    );
}

// ============================================================
// INITIALS
// ============================================================

function getInitials(
    name: string,
): string {
    const normalized =
        normalizeString(
            name,
        );

    if (!normalized) {
        return 'S';
    }

    return normalized
        .split(/\s+/)
        .map(
            word =>
                word.charAt(
                    0,
                ),
        )
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// ============================================================
// STYLE CONSTANTS
// ============================================================

const stylesVars = {
    primary:
        '#009D94',

    primaryDark:
        '#009D94',

    background:
        '#F8F7FC',

    card:
        '#FFFFFF',

    text:
        '#17121F',

    secondaryText:
        '#6F6878',

    border:
        '#E7E2ED',

    placeholder:
        '#A39BAA',

    danger:
        '#DC2626',
};

// ============================================================
// STYLES
// ============================================================

const styles =
    StyleSheet.create({
        flex: {
            flex: 1,
        },

        container: {
            flex: 1,
            backgroundColor:
                stylesVars.background,
        },

        centerContainer: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                30,
        },

        loadingText: {
            marginTop: 14,
            fontSize: 14,
            color:
                stylesVars.secondaryText,
        },

        errorTitle: {
            fontSize: 21,
            fontWeight:
                '700',
            color:
                stylesVars.text,
            marginBottom: 8,
        },

        errorMessage: {
            textAlign:
                'center',
            fontSize: 14,
            lineHeight: 21,
            color:
                stylesVars.secondaryText,
            marginBottom: 24,
        },

        secondaryButton: {
            minWidth: 120,
            height: 46,
            paddingHorizontal: 24,
            borderRadius: 12,
            alignItems:
                'center',
            justifyContent:
                'center',
            backgroundColor:
                stylesVars.text,
        },

        secondaryButtonText: {
            color:
                '#FFFFFF',
            fontSize: 14,
            fontWeight:
                '700',
        },

        // ====================================================
        // HEADER
        // ====================================================

        header: {
            height: 58,
            flexDirection:
                'row',
            alignItems:
                'center',
            paddingHorizontal:
                16,
            backgroundColor:
                '#FFFFFF',
            borderBottomWidth:
                1,
            borderBottomColor:
                stylesVars.border,
        },

        backButton: {
            width: 40,
            height: 40,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        backIcon: {
            fontSize: 34,
            lineHeight: 36,
            color:
                stylesVars.text,
            fontWeight:
                '300',
        },

        headerTitle: {
            flex: 1,
            textAlign:
                'center',
            fontSize: 18,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        headerSpacer: {
            width: 40,
        },

        scrollContent: {
            paddingHorizontal:
                16,
            paddingTop:
                18,
        },

        // ====================================================
        // SECTIONS
        // ====================================================

        section: {
            backgroundColor:
                stylesVars.card,
            borderRadius:
                18,
            padding:
                18,
            marginBottom:
                16,
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
        },

        sectionTitle: {
            fontSize: 18,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        sectionSubtitle: {
            fontSize: 13,
            lineHeight: 19,
            color:
                stylesVars.secondaryText,
            marginTop: 5,
            marginBottom: 18,
        },

        // ====================================================
        // INPUT
        // ====================================================

        inputContainer: {
            marginBottom:
                15,
        },

        inputLabelRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
            justifyContent:
                'space-between',
            marginBottom:
                7,
        },

        inputLabel: {
            fontSize: 13,
            fontWeight:
                '600',
            color:
                stylesVars.text,
        },

        optionalText: {
            fontSize: 11,
            color:
                stylesVars.secondaryText,
        },

        input: {
            minHeight: 48,
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
            borderRadius:
                12,
            paddingHorizontal:
                14,
            paddingVertical:
                11,
            backgroundColor:
                '#FFFFFF',
            color:
                stylesVars.text,
            fontSize: 14,
        },

        multilineInput: {
            minHeight: 90,
        },

        // ====================================================
        // LOGO
        // ====================================================

        logoRow: {
            flexDirection:
                'row',
            alignItems:
                'center',
        },

        logoPreview: {
            width: 92,
            height: 92,
            borderRadius:
                46,
            backgroundColor:
                '#F0EAFE',
            alignItems:
                'center',
            justifyContent:
                'center',
            overflow:
                'hidden',
            borderWidth:
                1,
            borderColor:
                stylesVars.border,
        },

        logoImage: {
            width: '100%',
            height: '100%',
            resizeMode:
                'cover',
        },

        logoPlaceholder: {
            fontSize: 25,
            fontWeight:
                '800',
            color:
                stylesVars.primary,
        },

        logoActions: {
            flex: 1,
            marginLeft:
                16,
        },

        outlineButton: {
            minHeight: 44,
            paddingHorizontal:
                16,
            borderRadius:
                11,
            borderWidth:
                1,
            borderColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            alignSelf:
                'flex-start',
        },

        outlineButtonText: {
            color:
                stylesVars.primary,
            fontSize: 13,
            fontWeight:
                '700',
        },

        imageHint: {
            fontSize: 11,
            color:
                stylesVars.secondaryText,
            marginTop: 8,
            lineHeight: 16,
        },

        // ====================================================
        // COVER
        // ====================================================

        coverContainer: {
            height: 190,
            borderRadius:
                15,
            overflow:
                'hidden',
            backgroundColor:
                '#F0EDF4',
            position:
                'relative',
        },

        coverImage: {
            width: '100%',
            height: '100%',
            resizeMode:
                'cover',
        },

        coverPlaceholder: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        coverPlaceholderText: {
            fontSize: 14,
            color:
                stylesVars.secondaryText,
        },

        coverButton: {
            position:
                'absolute',
            right: 12,
            bottom: 12,
            paddingHorizontal: 15,
            minHeight: 42,
            borderRadius: 11,
            alignItems:
                'center',
            justifyContent:
                'center',
            backgroundColor:
                'rgba(0,0,0,0.70)',
        },

        coverButtonText: {
            color:
                '#FFFFFF',
            fontSize: 13,
            fontWeight:
                '700',
        },

        // ====================================================
        // GALLERY
        // ====================================================

        galleryHeader: {
            flexDirection:
                'row',
            alignItems:
                'flex-start',
            justifyContent:
                'space-between',
        },

        galleryTitleContainer: {
            flex: 1,
        },

        galleryCount: {
            fontSize: 13,
            fontWeight:
                '700',
            color:
                stylesVars.primary,
            marginTop: 3,
        },

        emptyGallery: {
            minHeight: 170,
            borderRadius:
                14,
            borderWidth:
                1,
            borderStyle:
                'dashed',
            borderColor:
                '#CFC6D8',
            alignItems:
                'center',
            justifyContent:
                'center',
            paddingHorizontal:
                24,
        },

        emptyGalleryIcon: {
            width: 44,
            height: 44,
            borderRadius:
                22,
            backgroundColor:
                '#F0EAFE',
            color:
                stylesVars.primary,
            fontSize: 27,
            textAlign:
                'center',
            lineHeight: 42,
            marginBottom:
                10,
        },

        emptyGalleryTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                stylesVars.text,
        },

        emptyGalleryText: {
            fontSize: 12,
            color:
                stylesVars.secondaryText,
            textAlign:
                'center',
            marginTop: 5,
            lineHeight: 18,
        },

        galleryGrid: {
            flexDirection:
                'row',
            flexWrap:
                'wrap',
            marginHorizontal:
                -4,
        },

        galleryItem: {
            width: '33.3333%',
            aspectRatio: 1,
            padding: 4,
        },

        galleryImage: {
            width: '100%',
            height: '100%',
            borderRadius:
                12,
            resizeMode:
                'cover',
            backgroundColor:
                '#F0EDF4',
        },

        removeGalleryButton: {
            position:
                'absolute',
            right: 8,
            top: 8,
            width: 28,
            height: 28,
            borderRadius:
                14,
            backgroundColor:
                'rgba(0,0,0,0.72)',
            alignItems:
                'center',
            justifyContent:
                'center',
        },

        removeGalleryText: {
            color:
                '#FFFFFF',
            fontSize: 22,
            lineHeight: 23,
            fontWeight:
                '300',
        },

        addGalleryButton: {
            height: 46,
            borderRadius:
                12,
            borderWidth:
                1,
            borderColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginTop:
                14,
        },

        addGalleryButtonText: {
            fontSize: 13,
            fontWeight:
                '700',
            color:
                stylesVars.primary,
        },

        // ====================================================
        // INFO
        // ====================================================

        infoCard: {
            backgroundColor:
                '#F0EAFE',
            borderRadius:
                16,
            padding:
                16,
            marginBottom:
                16,
            borderWidth:
                1,
            borderColor:
                '#DDD1FA',
        },

        infoTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                stylesVars.text,
            marginBottom:
                6,
        },

        infoText: {
            fontSize: 12,
            lineHeight: 18,
            color:
                '#5E5368',
        },

        // ====================================================
        // SUBMISSION LOCK
        // ====================================================

        lockedCard: {
            backgroundColor:
                '#FFF7ED',
            borderRadius:
                16,
            padding:
                16,
            marginBottom:
                16,
            borderWidth:
                1,
            borderColor:
                '#FED7AA',
        },

        lockedTitle: {
            fontSize: 14,
            fontWeight:
                '700',
            color:
                '#9A3412',
            marginBottom:
                6,
        },

        lockedText: {
            fontSize: 12,
            lineHeight: 18,
            color:
                '#7C2D12',
        },

        // ====================================================
        // SAVE
        // ====================================================

        saveButton: {
            minHeight: 52,
            borderRadius:
                14,
            backgroundColor:
                stylesVars.primary,
            alignItems:
                'center',
            justifyContent:
                'center',
            flexDirection:
                'row',
            gap: 9,
            marginBottom:
                10,
        },

        saveButtonDisabled: {
            opacity:
                0.65,
        },

        saveButtonText: {
            color:
                '#FFFFFF',
            fontSize: 15,
            fontWeight:
                '700',
        },
    });