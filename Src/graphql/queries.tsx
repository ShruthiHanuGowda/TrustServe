import { gql } from '@apollo/client';

export const SEND_OTP = gql`
  mutation SendOTP($phoneNumber: String!) {
    sendOTP(phoneNumber: $phoneNumber) {
      success
      message
    }
  }
`;


// ============================================================
// RESEND OTP
// ============================================================

export const RESEND_OTP = gql`
  mutation ResendOTP($phoneNumber: String!) {
    resendOTP(phoneNumber: $phoneNumber) {
      success
      message
    }
  }
`;


// ============================================================
// VERIFY OTP
// ============================================================

export const VERIFY_OTP = gql`
  mutation VerifyOTP(
    $phoneNumber: String!
    $otp: String!
  ) {
    verifyOTP(
      phoneNumber: $phoneNumber
      otp: $otp
    ) {
      success
      message
      isExistingUser

      user {
        userId
        phoneNumber
        fullName

        roles {
          customer
          businessPartner
        }

        activeRole
        providerStatus
        salonId

        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      success
      message

      user {
        userId
        phoneNumber
        fullName
        salonId
        activeRole
        providerStatus

        roles {
          customer
          businessPartner
        }

        createdAt
        updatedAt
      }
    }
  }
`;


export const REGISTER_SALON_PARTNER = gql`
  mutation RegisterSalonPartner(
    $input: RegisterSalonPartnerInput!
  ) {
    registerSalonPartner(input: $input) {
      success
      message
      salonId
    }
  }
`;


export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      success
      message
      service {
        serviceId
        salonId
        name
        category
        description
        duration
        price
        gender
        popular
        active
        createdAt
      }
    }
  }
`;

export const UPDATE_SERVICE = gql`
mutation UpdateService($input: UpdateServiceInput!) {
  updateService(input: $input) {
    success
    message
    service {
      serviceId
      name
      category
      description
      duration
      price
      gender
      popular
      active
    }
  }
}`;


export const DELETE_SERVICE = gql`
mutation DeleteService($input: DeleteServiceInput!) {
  deleteService(input: $input) {
    success
    message
  }
}`;

export const LIST_SERVICES = gql`
query ListServices($salonId: ID!) {
  listServices(salonId: $salonId) {
    serviceId
    salonId
    name
    category
    description
    duration
    price
    gender
    popular
    active
    createdAt
  }
}`

export const GET_BOOKING = gql`
    query GetBooking($bookingId: ID!) {
        GetBooking(bookingId: $bookingId) {
            bookingId
            salonId
            customerUserId

            salonName
            customerName
            customerPhone

            bookingDate
            startTime
            endTime

            staffId
            staffName

            services {
                serviceId
                name
                category
                duration
                price
            }

            totalDuration
            subtotal
            discount
            totalAmount

            paymentMethod
            paymentStatus
            preferredPaymentMethod
            bookingStatus

            notes
            salonNote

            bookingFee
            bookingFeeStatus
            bookingFeePaidAt
            remainingAmount

            razorpayOrderId
            razorpayPaymentId
            paymentGateway

            reviewSubmitted
            rating
            review
            reviewedAt

            createdAt
            updatedAt
        }
    }
`;



// export const GET_NEARBY_SALONS = gql`
//   query NearbySalons(
//     $latitude: Float!
//     $longitude: Float!
//     $radius: Float!
//     $search: String
//     $category: String
//   ) {
//     nearbySalons(
//       latitude: $latitude
//       longitude: $longitude
//       radius: $radius
//       search: $search
//       category: $category
//     ) {
//       salonId
//       salonName
//       averageRating
//       totalReviews
//       logoUrl
//       distance
//       salonStatus
//       minServicePrice

//       matchingServices {
//         serviceId
//         name
//         category
//         price
//       }

//       businessHours {
//         MONDAY {
//           open
//           close
//           isOpen
//         }
//         TUESDAY {
//           open
//           close
//           isOpen
//         }
//         WEDNESDAY {
//           open
//           close
//           isOpen
//         }
//         THURSDAY {
//           open
//           close
//           isOpen
//         }
//         FRIDAY {
//           open
//           close
//           isOpen
//         }
//         SATURDAY {
//           open
//           close
//           isOpen
//         }
//         SUNDAY {
//           open
//           close
//           isOpen
//         }
//       }

//       address {
//         addressLine
//         city
//         state
//         pincode
//       }
//     }
//   }
// `;
export const GET_NEARBY_SALONS = gql`
  query NearbySalons(
    $latitude: Float!
    $longitude: Float!
    $radius: Float!
    $search: String
    $category: String
    $minPrice: Float
    $maxPrice: Float
  ) {
    nearbySalons(
      latitude: $latitude
      longitude: $longitude
      radius: $radius
      search: $search
      category: $category
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      salonId
      salonName
      averageRating
      totalReviews

      # ============================================================
      # SALON MEDIA
      # ============================================================
      logoUrl
      coverImageUrl
      galleryImages

      logoMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      coverMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      galleryMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      distance
      salonStatus
      minServicePrice

      matchingServices {
        serviceId
        name
        category
        price
      }

      businessHours {
        MONDAY {
          open
          close
          isOpen
        }
        TUESDAY {
          open
          close
          isOpen
        }
        WEDNESDAY {
          open
          close
          isOpen
        }
        THURSDAY {
          open
          close
          isOpen
        }
        FRIDAY {
          open
          close
          isOpen
        }
        SATURDAY {
          open
          close
          isOpen
        }
        SUNDAY {
          open
          close
          isOpen
        }
      }

      address {
        addressLine
        city
        state
        pincode
      }
    }
  }
`;

export const CREATE_BOOKING = gql`
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    success
    message
    booking {
      bookingId
    }
  }
}`;

export const CUSTOMER_BOOKINGS = gql`
query CustomerBookings($customerUserId: ID!) {
  customerBookings(customerUserId: $customerUserId) {
    bookingId
    salonId
    customerUserId
    salonName
    customerName
    bookingDate
    startTime
    endTime
    reviewSubmitted
    rating
    review
    reviewedAt
    bookingStatus
    paymentMethod
    paymentStatus
    preferredPaymentMethod
    bookingFee
    bookingFeeStatus
    bookingFeePaidAt
    remainingAmount
    totalAmount
    services {
      serviceId
      name
      category
      duration
      price
    }
  }
}
`;

// export const GET_SALON = gql`
//     query GetSalon($salonId: ID!) {
//         getSalon(salonId: $salonId) {
//             salonId
//             ownerUserId
//             salonName
//             ownerName
//             businessType
//             ownerPhoneNumber
//             alternatePhone
//             email

//             address {
//                 addressLine
//                 city
//                 state
//                 pincode
//             }

//             latitude
//             longitude
//             distance

//             logoUrl
//             coverImageUrl
//             galleryImages

//             businessHours {
//                 MONDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 TUESDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 WEDNESDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 THURSDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 FRIDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 SATURDAY {
//                     open
//                     close
//                     isOpen
//                 }
//                 SUNDAY {
//                     open
//                     close
//                     isOpen
//                 }
//             }

//             kycStatus
//             salonStatus
//             isActive
//             isVisible
//             isDeleted

//             averageRating
//             totalReviews
//             totalAppointments
//             totalCompletedAppointments
//             totalCancelledAppointments

//             createdAt
//             updatedAt
//         }
//     }
// `;

export const UPDATE_BUSINESS_HOURS = gql`
  mutation UpdateBusinessHours(
    $input: UpdateBusinessHoursInput!
  ) {
    updateBusinessHours(input: $input) {
      success
      message

      salon {
        salonId
        salonName
        businessHours {
          MONDAY {
            open
            close
            isOpen
          }
          TUESDAY {
            open
            close
            isOpen
          }
          WEDNESDAY {
            open
            close
            isOpen
          }
          THURSDAY {
            open
            close
            isOpen
          }
          FRIDAY {
            open
            close
            isOpen
          }
          SATURDAY {
            open
            close
            isOpen
          }
          SUNDAY {
            open
            close
            isOpen
          }
        }
      }
    }
  }
`;

export const GET_SALON_BUSINESS_HOURS = gql`
  query GetSalonBusinessHours(
    $salonId: ID!
  ) {
    getSalon(salonId: $salonId) {
      salonId
      salonName

      businessHours {
        MONDAY {
          open
          close
          isOpen
        }
        TUESDAY {
          open
          close
          isOpen
        }
        WEDNESDAY {
          open
          close
          isOpen
        }
        THURSDAY {
          open
          close
          isOpen
        }
        FRIDAY {
          open
          close
          isOpen
        }
        SATURDAY {
          open
          close
          isOpen
        }
        SUNDAY {
          open
          close
          isOpen
        }
      }
    }
  }
`;

//list salon bookings
export const LIST_BOOKINGS = gql`query SalonBookings($salonId: ID!) {
  salonBookings(salonId: $salonId) {
    bookingId
    customerName
    customerPhone
    bookingDate
    startTime
    endTime
    bookingStatus
    totalAmount
    bookingFeeStatus
    bookingFee
    services {
      name
    }
  }
}`;

export const ACCEPT_BOOKING = gql`
mutation AcceptBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CONFIRMED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingId
      bookingStatus
      salonNote
    }
  }
}
`;

export const REJECT_BOOKING = gql`
mutation RejectBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CANCELLED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingStatus
      salonNote
    }
  }
}
`;

export const CANCEL_BOOKING = gql`
mutation CancelBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CANCELLED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingId
      bookingStatus
      salonNote
    }
  }
}
`;

export const COMPLETE_BOOKING = gql`
  mutation CompleteBooking($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      success
      message
      booking {
        bookingId
        bookingStatus
        updatedAt
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    success
    message
    review {
      reviewId
      rating
      review
    }
  }
}`;

export const SALON_DASHBOARD_QUERY = gql`
  query SalonDashboard($salonId: ID!) {
    salonBookings(salonId: $salonId) {
      bookingId
      salonId
      customerUserId
      salonName
      customerName
      customerPhone
      bookingDate
      startTime
      endTime

      services {
        serviceId
        name
        category
        duration
        price
      }

      totalDuration
      subtotal
      discount
      totalAmount

      paymentMethod
      paymentStatus
      bookingStatus

      notes
      salonNote

      bookingFee
      bookingFeeStatus
      bookingFeePaidAt
      remainingAmount

      razorpayOrderId
      razorpayPaymentId
      paymentGateway

      reviewSubmitted
      rating
      review
      reviewedAt

      createdAt
      updatedAt
    }
  }
`;

export const LIST_STAFF = gql`
    query ListStaff($salonId: ID!) {
        listStaff(salonId: $salonId) {
            staffId
            salonId
            name
            phoneNumber
            email
            gender
            profileImageUrl
            specializations

            workingHours {
                MONDAY {
                    open
                    close
                    isWorking
                }
                TUESDAY {
                    open
                    close
                    isWorking
                }
                WEDNESDAY {
                    open
                    close
                    isWorking
                }
                THURSDAY {
                    open
                    close
                    isWorking
                }
                FRIDAY {
                    open
                    close
                    isWorking
                }
                SATURDAY {
                    open
                    close
                    isWorking
                }
                SUNDAY {
                    open
                    close
                    isWorking
                }
            }

            isActive
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_STAFF = gql`
    mutation UpdateStaff($input: UpdateStaffInput!) {
        updateStaff(input: $input) {
            success
            message
            staff {
                staffId
                salonId
                name
                phoneNumber
                email
                gender
                profileImageUrl
                specializations

                workingHours {
                    MONDAY {
                        open
                        close
                        isWorking
                    }
                    TUESDAY {
                        open
                        close
                        isWorking
                    }
                    WEDNESDAY {
                        open
                        close
                        isWorking
                    }
                    THURSDAY {
                        open
                        close
                        isWorking
                    }
                    FRIDAY {
                        open
                        close
                        isWorking
                    }
                    SATURDAY {
                        open
                        close
                        isWorking
                    }
                    SUNDAY {
                        open
                        close
                        isWorking
                    }
                }

                isActive
                createdAt
                updatedAt
            }
        }
    }
`;

export const CREATE_STAFF = gql`
    mutation CreateStaff($input: CreateStaffInput!) {
        createStaff(input: $input) {
            success
            message

            staff {
                staffId
                salonId
                name
                phoneNumber
                email
                gender
                specializations
                isActive
            }
        }
    }
`;

export const ADD_FAVORITE_SALON = gql`
  mutation AddFavoriteSalon($input: FavoriteSalonInput!) {
    addFavoriteSalon(input: $input) {
      success
      message
      favorite {
        favoriteId
        userId
        salonId
        createdAt
      }
    }
  }
`;

export const REMOVE_FAVORITE_SALON = gql`
  mutation RemoveFavoriteSalon($input: FavoriteSalonInput!) {
    removeFavoriteSalon(input: $input) {
      success
      message
      favorite {
        favoriteId
        userId
        salonId
        createdAt
      }
    }
  }
`;

export const GET_FAVORITE_SALONS = gql`
  query GetFavoriteSalons($userId: ID!) {
    favoriteSalons(userId: $userId) {
      favoriteId
      userId
      salonId
      createdAt
      salon {
        salonId
        salonName
        logoUrl
        averageRating
        totalReviews
        address {
          addressLine
          city
          state
          pincode
        }
      }
    }
  }
`;

export const IS_FAVORITE_SALON = gql`
    query IsFavoriteSalon(
        $userId: ID!
        $salonId: ID!
    ) {
        isFavoriteSalon(
            userId: $userId
            salonId: $salonId
        )
    }
`;

export const CREATE_RAZORPAY_ORDER = gql`
mutation CreateRazorpayOrder(
  $input: CreateRazorpayOrderInput!
){
  createRazorpayOrder(
    input:$input
  ){
    success
    message
    order{
      orderId
      amount
      currency
      keyId
    }
  }
}
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
mutation VerifyRazorpayPayment(
  $input: VerifyRazorpayPaymentInput!
){
  verifyRazorpayPayment(
    input:$input
  ){
    success
    message
    booking{
      bookingId
      bookingFeeStatus
      paymentStatus
      bookingFeePaidAt
      razorpayOrderId
      razorpayPaymentId
    }
  }
}
`;


export const PAYMENT_TRANSACTIONS = gql`
  query PaymentTransactions(
    $bookingId: ID!
  ) {
    paymentTransactions(
      bookingId: $bookingId
    ) {
      success
      message
      totalCount

      transactions {
        paymentTransactionId
        bookingId
        customerUserId
        salonId

        razorpayOrderId
        razorpayPaymentId

        amount
        currency

        paymentType
        paymentMethod

        status
        failureReason

        createdAt
        updatedAt
        paidAt
      }
    }
  }
`;

export const UPDATE_PREFERRED_PAYMENT_METHOD = gql`
    mutation UpdatePreferredPaymentMethod(
        $input: UpdatePreferredPaymentMethodInput!
    ) {
        updatePreferredPaymentMethod(input: $input) {
            success
            message
            user {
                userId
                preferredPaymentMethod
            }
        }
    }
`;

export const REGISTER_DEVICE_TOKEN = gql`
  mutation RegisterDeviceToken(
    $userId: ID!
    $token: String!
    $platform: String
  ) {
    registerDeviceToken(
      userId: $userId
      token: $token
      platform: $platform
    ) {
      success
      message
    }
  }
`;

export const REMOVE_DEVICE_TOKEN = gql`
  mutation RemoveDeviceToken($userId: ID!, $token: String!) {
    removeDeviceToken(
      userId: $userId
      token: $token
    ) {
      success
      message
    }
  }
`;

// export const SALON_OFFERS = gql`
//   query SalonOffers($salonId: ID, $status: OfferStatus) {
//     salonOffers(salonId: $salonId, status: $status) {
//       success
//       message
//       offers {
//         offerId
//         salonId
//         title
//         description
//         discountType
//         discountValue
//         couponCode
//         minimumBookingAmount
//         category
//         serviceIds
//         startDate
//         endDate
//         usageLimit
//         usageCount
//         customerLimit
//         status
//         rejectionReason
//         approvedBy
//         approvedAt
//         createdAt
//         updatedAt
//       }
//       totalCount
//     }
//   }
// `;

// export const DELETE_OFFER = gql`
//   mutation DeleteOffer($input: DeleteOfferInput!) {
//     deleteOffer(input: $input) {
//       success
//       message
//       offer {
//         offerId
//         salonId
//         title
//         status
//       }
//     }
//   }
// `;

// export const CREATE_OFFER = gql`
//   mutation CreateOffer(
//     $input: CreateOfferInput!
//   ) {
//     createOffer(input: $input) {
//       success
//       message
//       offer {
//         offerId
//         salonId
//         title
//         description
//         discountType
//         discountValue
//         couponCode
//         minimumBookingAmount
//         category
//         serviceIds
//         startDate
//         endDate
//         usageLimit
//         usageCount
//         customerLimit
//         status
//         rejectionReason
//         approvedBy
//         approvedAt
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;


// export const UPDATE_OFFER = gql`
//   mutation UpdateOffer(
//     $input: UpdateOfferInput!
//   ) {
//     updateOffer(input: $input) {
//       success
//       message
//       offer {
//         offerId
//         salonId
//         title
//         description
//         discountType
//         discountValue
//         couponCode
//         minimumBookingAmount
//         category
//         serviceIds
//         startDate
//         endDate
//         usageLimit
//         usageCount
//         customerLimit
//         status
//         rejectionReason
//         approvedBy
//         approvedAt
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;




export const SALON_OFFERS = gql`
  query SalonOffers($salonId: ID, $status: OfferStatus) {
    salonOffers(salonId: $salonId, status: $status) {
      success
      message
      offers {
        offerId
        salonId
        title
        description
        discountType
        discountValue
        couponCode
        minimumBookingAmount
        category
        serviceIds
        startDate
        endDate
        usageLimit
        usageCount
        customerLimit
        status
        rejectionReason
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const CREATE_OFFER = gql`
  mutation CreateOffer($input: CreateOfferInput!) {
    createOffer(input: $input) {
      success
      message
      offer {
        offerId
        salonId
        title
        description
        discountType
        discountValue
        couponCode
        minimumBookingAmount
        category
        serviceIds
        startDate
        endDate
        usageLimit
        usageCount
        customerLimit
        status
        rejectionReason
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_OFFER = gql`
  mutation UpdateOffer($input: UpdateOfferInput!) {
    updateOffer(input: $input) {
      success
      message
      offer {
        offerId
        salonId
        title
        description
        discountType
        discountValue
        couponCode
        minimumBookingAmount
        category
        serviceIds
        startDate
        endDate
        usageLimit
        usageCount
        customerLimit
        status
        rejectionReason
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_OFFER = gql`
  mutation DeleteOffer($input: DeleteOfferInput!) {
    deleteOffer(input: $input) {
      success
      message
      offer {
        offerId
        salonId
        title
        description
        discountType
        discountValue
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const ACTIVE_OFFERS = gql`
  query ActiveOffers($category: String) {
  activeOffers(category: $category) {
    success
    message
    totalCount
    offers {
      offerId
      salonId
      salonName
      title
      description
      discountType
      discountValue
      couponCode
      minimumBookingAmount
      category
      serviceIds
      startDate
      endDate
      usageLimit
      usageCount
      customerLimit
      status
      rejectionReason
      approvedBy
      approvedAt
      rejectedBy
      rejectedAt
      createdAt
      updatedAt
    }
  }
}
`;

export const LIST_SALON_SERVICES = gql`
    query ListSalonServices($salonId: ID!) {
        listServices(salonId: $salonId) {
            serviceId
            salonId
            name
            category
            description
            duration
            price
            gender
            popular
            active
            createdAt
            updatedAt
            updatedBy
        }
    }
`;

export const REQUEST_REFUND = gql`
    mutation RequestRefund($input: RequestRefundInput!) {
        requestRefund(input: $input) {
            success
            message
            refund {
                refundId
                bookingId
                paymentTransactionId
                customerUserId
                customerName
                customerPhone
                salonId
                salonName
                originalAmount
                refundAmount
                clavataAmount
                salonAmount
                reason
                status
                paymentMethod
                razorpayPaymentId
                razorpayRefundId
                requestedAt
                processedAt
                createdAt
                updatedAt
            }
        }
    }
`;

export const DELETE_SALON_MEDIA = gql`
    mutation DeleteSalonMedia(
        $input: DeleteSalonMediaInput!
    ) {
        deleteSalonMedia(
            input: $input
        ) {
            success
            message
            key
        }
    }
`;

// ============================================================
// GET SALON
// ============================================================

export const GET_SALON = gql`
  query GetSalon($salonId: ID!) {
    getSalon(salonId: $salonId) {
      salonId
      ownerUserId
      salonName
      ownerName
      businessType
      ownerPhoneNumber
      alternatePhone
      email

      address {
        addressLine
        city
        state
        pincode
      }

      latitude
      longitude

      logoUrl
      coverImageUrl
      galleryImages

      logoMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      coverMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      galleryMedia {
        imageId
        salonId
        mediaType
        key
        objectUrl
        status
        uploadedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
      }

      businessHours {
        MONDAY {
          open
          close
          isOpen
        }
        TUESDAY {
          open
          close
          isOpen
        }
        WEDNESDAY {
          open
          close
          isOpen
        }
        THURSDAY {
          open
          close
          isOpen
        }
        FRIDAY {
          open
          close
          isOpen
        }
        SATURDAY {
          open
          close
          isOpen
        }
        SUNDAY {
          open
          close
          isOpen
        }
      }

      kycStatus
      salonStatus
      isActive
      isVisible
      isDeleted
      averageRating
      totalReviews
      totalAppointments
      totalCompletedAppointments
      totalCancelledAppointments
      totalRevenue
      approvedBy
      approvedAt
      rejectedBy
      rejectedAt
      rejectionReason
      lastUpdatedBy
      createdAt
      updatedAt
    }
  }
`;
// ============================================================
// S3 UPLOAD URL
// ============================================================

export const GENERATE_SALON_MEDIA_UPLOAD_URL = gql`
    mutation GenerateSalonMediaUploadUrl(
        $input: GenerateSalonMediaUploadUrlInput!
    ) {
        generateSalonMediaUploadUrl(
            input: $input
        ) {
            success
            message
            uploadUrl
            objectUrl
            key
            salonId
            mediaType
            contentType
            imageId
            expiresIn
        }
    }
`;

export const CREATE_SALON_MEDIA = gql`
    mutation CreateSalonMedia(
        $input: CreateSalonMediaInput!
    ) {
        createSalonMedia(
            input: $input
        ) {
            success
            message
            media {
                imageId
                salonId
                mediaType
                key
                objectUrl
                status
                uploadedAt
                approvedAt
                approvedBy
                rejectedAt
                rejectedBy
                rejectionReason
            }
        }
    }
`;
// ============================================================
// UPDATE SALON PROFILE
// ============================================================

export const UPDATE_SALON_PROFILE = gql`
    mutation UpdateSalonProfile(
        $input: UpdateSalonProfileInput!
    ) {
        updateSalonProfile(input: $input) {
            success
            message

            salon {
                salonId
                ownerUserId
                salonName
                ownerName
                businessType
                ownerPhoneNumber
                alternatePhone
                email

                address {
                    addressLine
                    city
                    state
                    pincode
                }

                logoUrl
                coverImageUrl
                galleryImages

                kycStatus
                salonStatus

                isActive
                isVisible
                isDeleted

                averageRating
                totalReviews
                totalAppointments
                totalCompletedAppointments
                totalCancelledAppointments
                totalRevenue

                createdAt
                updatedAt
            }
        }
    }
`;

export const GET_PENDING_SALON_PROFILE_CHANGE = gql`
    query GetPendingSalonProfileChange(
        $salonId: ID!
    ) {
        getPendingSalonProfileChange(
            salonId: $salonId
        ) {
            changeId
            salonId
            status
            submittedAt
            rejectionReason
        }
    }
`;