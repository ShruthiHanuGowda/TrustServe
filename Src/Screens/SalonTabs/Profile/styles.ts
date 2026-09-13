import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  profileHeader: {
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#F7F9F9',
  // },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  addButton: {
    backgroundColor: '#009D94',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },

  staffList: {
    gap: 14,
  },

  staffCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },

  staffTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#009D94',
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },

  staffPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },

  staffEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#E8F7F1',
  },

  inactiveBadge: {
    backgroundColor: '#F1F1F1',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  activeDot: {
    backgroundColor: '#20A66A',
  },

  inactiveDot: {
    backgroundColor: '#999',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  activeText: {
    color: '#168050',
  },

  inactiveText: {
    color: '#777',
  },

  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 7,
  },

  specializationTag: {
    backgroundColor: '#F0F6F6',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  specializationText: {
    fontSize: 12,
    color: '#007F78',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },

  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8E3E2',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#333',
    fontWeight: '600',
  },

  disableButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E7CACA',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },

  disableButtonText: {
    color: '#C44B4B',
    fontWeight: '600',
  },

  enableButton: {
    borderColor: '#B9DED9',
  },

  enableButtonText: {
    color: '#008F87',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#009D94',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
  },

  // avatar: {
  //   width: 90,
  //   height: 90,
  //   borderRadius: 45,
  //   backgroundColor: '#FFF',
  //   marginBottom: 15,
  // },

  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  profileRole: {
    marginTop: 5,
    fontSize: 15,
    color: '#E5E7EB',
  },

  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 18,
    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  menuArrow: {
    fontSize: 24,
    color: '#BDBDBD',
    marginLeft: 12,
  },

  switchButton: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  back: {
    fontSize: 28,
    color: '#333',
    marginRight: 15,
  },

  switchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  logoutButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  logoutText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});