import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scroll: {
    flex: 1,
  },

  /* =========================
        HEADER
  ========================= */

  header: {
    // backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  greeting: {
    color: '#E8F8F6',
    fontSize: 15,
  },

  salonName: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
  },

headerTopRow: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

salonInfo: {
  flex: 1,
  alignItems: 'flex-start',
},

notificationButton: {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',

  // Subtle professional elevation
  elevation: 4,

  // iOS shadow
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.08,
  shadowRadius: 6,

  marginLeft: 16,
},

notificationBadge: {
  position: 'absolute',
  top: 3,
  right: 2,

  minWidth: 18,
  height: 18,
  borderRadius: 9,

  backgroundColor: '#E53935',

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 4,

  borderWidth: 2,
  borderColor: '#FFFFFF',
},

notificationBadgeText: {
  color: '#FFFFFF',
  fontSize: 9,
  fontWeight: '800',
  lineHeight: 12,
  textAlign: 'center',
},
  /* =========================
        SECTION
  ========================= */

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 10,
  },

  /* =========================
        SUMMARY CARD
  ========================= */

  summaryContainer: {
    paddingHorizontal: 20,
  },

  summaryCard: {
    width: 170,
    marginRight: 15,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 18,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  summaryTitle: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
  },

  summaryValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },

  /* =========================
        QUICK ACTIONS
  ========================= */

  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',

    paddingHorizontal: 20,
  },

  actionCard: {
    width: '48%',

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    paddingVertical: 24,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  actionIcon: {
    fontSize: 34,
    marginBottom: 12,
  },

  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  /* =========================
        APPOINTMENTS
  ========================= */

  appointmentCard: {
    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginBottom: 16,

    borderRadius: 18,

    padding: 18,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  service: {
    marginTop: 6,
    fontSize: 15,
    color: '#6B7280',
  },

  appointmentTime: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },

  statusBadge: {
    marginTop: 16,

    alignSelf: 'flex-start',

    paddingHorizontal: 14,
    paddingVertical: 6,

    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* =========================
        REVIEWS
  ========================= */

  reviewCard: {
    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginBottom: 16,

    borderRadius: 18,

    padding: 18,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  reviewName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  reviewStars: {
    fontSize: 16,
  },

  reviewText: {
    marginTop: 12,

    fontSize: 15,

    color: '#6B7280',

    lineHeight: 22,
  },

  replyButton: {
    alignSelf: 'flex-start',

    marginTop: 18,

    backgroundColor: PRIMARY,

    paddingHorizontal: 22,
    paddingVertical: 10,

    borderRadius: 22,
  },

  replyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  /* =========================
        COMMON
  ========================= */

  spacer: {
    height: 40,
  },
});