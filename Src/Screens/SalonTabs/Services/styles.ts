import { StyleSheet } from 'react-native';

const PRIMARY = '#009D94';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    header: {
        // backgroundColor: PRIMARY,
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 0,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },

    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },

    searchContainer: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 16,
        elevation: 2,
    },

    searchText: {
        color: '#9CA3AF',
    },

    categoryContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    categoryButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: '#ECEFF1',
        borderRadius: 22,
        marginRight: 10,
    },

    categoryActive: {
        backgroundColor: PRIMARY,
    },

    categoryText: {
        color: '#555',
        fontWeight: '600',
    },

    categoryTextActive: {
        color: '#FFF',
    },

    card: {
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 18,
        padding: 18,
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    duration: {
        marginTop: 6,
        color: '#6B7280',
        fontSize: 14,
    },

    price: {
        fontSize: 20,
        fontWeight: '700',
        color: PRIMARY,
    },

    badge: {
        marginTop: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        backgroundColor: '#E8F8F6',
    },

    badgeText: {
        color: PRIMARY,
        fontWeight: '700',
        fontSize: 12,
    },

    switchRow: {
        marginTop: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    actionRow: {
        flexDirection: 'row',
        marginTop: 18,
    },

    editButton: {
        flex: 1,
        backgroundColor: PRIMARY,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 10,
    },

    deleteButton: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },

    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 15,
    },

    fab: {
        position: 'absolute',
        right: 25,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },

    fabText: {
        color: '#FFF',
        fontSize: 34,
        marginTop: -2,
        fontWeight: '600',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },

    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 30,
        maxHeight: '92%',
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 22,
    },

    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        minHeight: 52,
        marginBottom: 16,
        backgroundColor: '#FFF',
        fontSize: 15,
        color: '#111827',
    },

    modalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
    },

    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    genderButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: '#FFF',
    },

    genderButtonSelected: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },

    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },

    genderButtonTextSelected: {
        color: '#FFF',
    },

    modalSwitchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },

    modalButtonRow: {
        flexDirection: 'row',
        marginTop: 24,
    },

    cancelButton: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 10,
    },

    saveButton: {
        flex: 1,
        backgroundColor: PRIMARY,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '700',
    },

    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});