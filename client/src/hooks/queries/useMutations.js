// ── All useMutation hooks ──────────────────────────────────────────────────
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.js';
import { queryKeys } from './queryKeys.js';

// ─── Announcements ────────────────────────────────────────────────────────

export const useCreateAnnouncement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/announcements/admin', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements }),
    });
};

export const useDeleteAnnouncement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/announcements/admin/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements }),
    });
};

export const useTogglePinAnnouncement = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isPinned }) => api.put(`/announcements/admin/${id}`, { isPinned }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements }),
    });
};

// ─── Events ───────────────────────────────────────────────────────────────

export const useCreateEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/events/admin', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
    });
};

export const useDeleteEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/events/admin/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events }),
    });
};

export const useRegisterEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => api.post('/events/register', { eventId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.events });
            qc.invalidateQueries({ queryKey: queryKeys.myEvents });
        },
    });
};

// ─── Gallery ──────────────────────────────────────────────────────────────

export const useUploadGallery = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData) => api.post('/gallery/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
    });
};

export const useDeleteGalleryItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/gallery/admin/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
    });
};

// ─── Content ──────────────────────────────────────────────────────────────

export const useUpdateContent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.put('/admin/content', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.templeContent }),
    });
};

export const useUploadDonationImage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData) => api.post('/admin/donation-images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.templeContent }),
    });
};

export const useRemoveDonationImage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (url) => api.post('/admin/donation-images/remove', { url }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.templeContent }),
    });
};

// ─── Settings ─────────────────────────────────────────────────────────────

export const useUpdateSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.put('/admin/settings', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.settings }),
    });
};

// ─── Users ────────────────────────────────────────────────────────────────

export const useUpdateUserRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }) => api.put(`/admin/users/${id}/role`, { role }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
    });
};

// ─── Volunteers ───────────────────────────────────────────────────────────

export const useApproveVolunteer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => api.put(`/volunteers/admin/${id}/approve`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.volunteers }),
    });
};

export const useRegisterVolunteer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/volunteers/register', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.volunteerProfile }),
    });
};

// ─── Financials ───────────────────────────────────────────────────────────

export const useCreateFinancialRecord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.post('/financials', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['financials'] });
            qc.invalidateQueries({ queryKey: ['financialSummary'] });
            qc.invalidateQueries({ queryKey: queryKeys.adminStats });
            qc.invalidateQueries({ queryKey: ['publicFinancials'] });
            qc.invalidateQueries({ queryKey: queryKeys.publicFinancialSummary });
        },
    });
};

export const useUpdateFinancialRecord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/financials/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['financials'] });
            qc.invalidateQueries({ queryKey: ['financialSummary'] });
            qc.invalidateQueries({ queryKey: queryKeys.adminStats });
            qc.invalidateQueries({ queryKey: ['publicFinancials'] });
            qc.invalidateQueries({ queryKey: queryKeys.publicFinancialSummary });
        },
    });
};

export const useDeleteFinancialRecord = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/financials/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['financials'] });
            qc.invalidateQueries({ queryKey: ['financialSummary'] });
            qc.invalidateQueries({ queryKey: queryKeys.adminStats });
            qc.invalidateQueries({ queryKey: ['publicFinancials'] });
            qc.invalidateQueries({ queryKey: queryKeys.publicFinancialSummary });
        },
    });
};

// ─── Profile ──────────────────────────────────────────────────────────────

export const useUpdateProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.put('/users/profile', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userProfile }),
    });
};

export const useChangeAvatar = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData) => api.post('/users/change', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userProfile }),
    });
};

export const useRemoveAvatar = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => api.delete('/users/remove'),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userProfile }),
    });
};

// ─── Contact ──────────────────────────────────────────────────────────────

export const useSendContactMessage = () =>
    useMutation({
        mutationFn: (data) => api.post('/admin/contact-messages', data),
    });
