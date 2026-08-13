// ── Centralized Query Key Factory ──────────────────────────────────────────
// Every useQuery / useInfiniteQuery / invalidation uses these keys.
// Grouping ensures correct cache invalidation after mutations.

export const queryKeys = {
    // Public / shared
    templeContent: ['templeContent'],
    announcements: ['announcements'],
    gallery: (filters = {}) => ['gallery', filters],
    events: ['events'],
    myEvents: ['myEvents'],

    // User
    userProfile: ['userProfile'],
    membershipStatus: ['membershipStatus'],
    volunteerProfile: ['volunteerProfile'],
    poojaSlots: (date) => ['poojaSlots', date],

    // Admin
    adminStats: ['adminStats'],
    donations: ['donations'],
    bookings: ['bookings'],
    volunteers: ['volunteers'],
    memberships: ['memberships'],
    users: ['users'],
    settings: ['settings'],

    // Financials
    financials: (params = {}) => ['financials', params],
    financialSummary: (params = {}) => ['financialSummary', params],
    publicFinancials: (params = {}) => ['publicFinancials', params],
    publicFinancialSummary: ['publicFinancialSummary'],
};
