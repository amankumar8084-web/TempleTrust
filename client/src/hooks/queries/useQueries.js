// ── All useQuery hooks ─────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.js';
import { queryKeys } from './queryKeys.js';

// ─── Public / Shared ──────────────────────────────────────────────────────

export const useTempleContent = () =>
    useQuery({
        queryKey: queryKeys.templeContent,
        queryFn: () => api.get('/admin/content').then(r => r.data.data),
        staleTime: 10 * 60 * 1000,
    });

export const useAnnouncements = () =>
    useQuery({
        queryKey: queryKeys.announcements,
        queryFn: () => api.get('/announcements').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useGallery = (filters = {}) => {
    const { page = 1, limit = 8, category, type } = filters;
    let url = `/gallery?page=${page}&limit=${limit}`;
    if (category && category !== 'All') url += `&category=${category}`;
    if (type && type !== 'All') url += `&type=${type}`;

    return useQuery({
        queryKey: queryKeys.gallery(filters),
        queryFn: () => api.get(url).then(r => r.data),
    });
};

export const useEvents = () =>
    useQuery({
        queryKey: queryKeys.events,
        queryFn: () => api.get('/events').then(r => r.data.data || []),
    });

export const useMyEvents = (enabled = false) =>
    useQuery({
        queryKey: queryKeys.myEvents,
        queryFn: () => api.get('/events/my-events').then(r => r.data.data || []),
        enabled,
    });

// ─── User ─────────────────────────────────────────────────────────────────

export const useUserProfile = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.userProfile,
        queryFn: () => api.get('/users/profile').then(r => r.data.data),
        enabled,
    });

export const useMembershipStatus = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.membershipStatus,
        queryFn: () => api.get('/memberships/status').then(r => r.data),
        enabled,
    });

export const useVolunteerProfile = (enabled = true) =>
    useQuery({
        queryKey: queryKeys.volunteerProfile,
        queryFn: () => api.get('/volunteers/profile').then(r => r.data.data),
        enabled,
    });

export const usePoojaSlots = (date) =>
    useQuery({
        queryKey: queryKeys.poojaSlots(date),
        queryFn: () => api.get(`/poojas/slots?date=${date}`).then(r => r.data),
        enabled: !!date,
        staleTime: 30 * 1000,
    });

// ─── Admin ────────────────────────────────────────────────────────────────

export const useAdminStats = () =>
    useQuery({
        queryKey: queryKeys.adminStats,
        queryFn: () => api.get('/admin/stats').then(r => r.data.data),
        staleTime: 2 * 60 * 1000,
    });

export const useDonations = () =>
    useQuery({
        queryKey: queryKeys.donations,
        queryFn: () => api.get('/donations/history').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useBookings = () =>
    useQuery({
        queryKey: queryKeys.bookings,
        queryFn: () => api.get('/poojas/admin/all-bookings').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useVolunteers = () =>
    useQuery({
        queryKey: queryKeys.volunteers,
        queryFn: () => api.get('/volunteers/admin/all').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useAdminMemberships = () =>
    useQuery({
        queryKey: queryKeys.memberships,
        queryFn: () => api.get('/memberships/admin/all').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useAdminUsers = () =>
    useQuery({
        queryKey: queryKeys.users,
        queryFn: () => api.get('/admin/users').then(r => r.data.data || []),
        staleTime: 2 * 60 * 1000,
    });

export const useSettings = () =>
    useQuery({
        queryKey: queryKeys.settings,
        queryFn: () => api.get('/admin/settings').then(r => r.data.data),
        staleTime: 10 * 60 * 1000,
    });

// ─── Financials ───────────────────────────────────────────────────────────

export const useFinancialRecords = (params = {}) =>
    useQuery({
        queryKey: queryKeys.financials(params),
        queryFn: () => {
            const qs = new URLSearchParams(params).toString();
            return api.get(`/financials?${qs}`).then(r => r.data);
        },
        staleTime: 60 * 1000,
    });

export const useFinancialSummary = (params = {}) =>
    useQuery({
        queryKey: queryKeys.financialSummary(params),
        queryFn: () => {
            const qs = new URLSearchParams(params).toString();
            return api.get(`/financials/summary?${qs}`).then(r => r.data.data);
        },
        staleTime: 60 * 1000,
    });

export const usePublicFinancials = (params = {}) =>
    useQuery({
        queryKey: queryKeys.publicFinancials(params),
        queryFn: () => {
            const qs = new URLSearchParams(params).toString();
            return api.get(`/financials/public?${qs}`).then(r => r.data);
        },
    });

export const usePublicFinancialSummary = () =>
    useQuery({
        queryKey: queryKeys.publicFinancialSummary,
        queryFn: () => api.get('/financials/public-summary').then(r => r.data.data),
    });
