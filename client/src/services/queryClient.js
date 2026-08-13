import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,       // 5 min — data is fresh
            gcTime: 10 * 60 * 1000,          // 10 min — unused cache kept
            refetchOnWindowFocus: false,
            retry: 1,
            refetchOnMount: true,
        },
    },
});

export default queryClient;
