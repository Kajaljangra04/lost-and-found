/* eslint-disable @typescript-eslint/no-explicit-any */
// RTK Query endpoint definitions. Request/response payloads travel to and from
// an external REST API whose shapes are validated server-side, so `any` is used
// deliberately at this service boundary.
import { baseApi } from "./baseApi";

const api = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // login and register
    login: builder.mutation({
      query: (data: any) => {
        return {
          url: "/login",
          method: "POST",
          body: data,
        };
      },
    }),
    registers: builder.mutation({
      query: (data: any) => {
        return {
          url: "/register",
          method: "POST",
          body: data,
        };
      },
    }),

    verifyEmail: builder.mutation({
      query: (data: { email: string; otp: string }) => ({
        url: "/verify-email",
        method: "POST",
        body: data,
      }),
    }),

    resendVerification: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/resend-verification",
        method: "POST",
        body: data,
      }),
    }),

    // item category
    category: builder.query({
      query: () => {
        return {
          url: "/item-categories",
          method: "GET",
        };
      },
      providesTags: ["categories"],
    }),
    createCategory: builder.mutation({
      query: (data: any) => {
        return {
          url: "/item-categories",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        return {
          url: `/item-categories/${id}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["categories"],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => {
        return {
          url: `/item-categories/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["categories"],
    }),

    // lost item
    getLostItems: builder.query({
      query: (data: any) => {
        return {
          url: "/lostItem",
          method: "GET",
          params: data,
        };
      },
      providesTags: ["mylostItems"],
    }),
    createLostItem: builder.mutation({
      query: (data: any) => {
        return {
          url: "/lostItem",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["mylostItems", "matches", "notifications", "adminData"],
    }),
    getSingleLostItem: builder.query({
      query: (id: string) => {
        return {
          url: `/lostItem/${id}`,
          method: "GET",
        };
      },
    }),
    getMyLostItem: builder.query({
      query: () => {
        return {
          url: `/my/lostItem`,
          method: "GET",
        };
      },
      providesTags: ["mylostItems"],
    }),
    editMyLostItem: builder.mutation({
      query: (data: any) => {
        return {
          url: `/my/lostItem`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["mylostItems"],
    }),
    deleteMyLostItem: builder.mutation({
      query: (id: string) => {
        return {
          url: `/my/lostItem/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["mylostItems"],
    }),

    // found item
    getMyFoundItem: builder.query({
      query: () => {
        return {
          url: `/my/foundItem`,
          method: "GET",
        };
      },
      providesTags: ["myFoundItems", "foundItems"],
    }),
    createFoundItem: builder.mutation({
      query: (data: any) => {
        return {
          url: `/found-items`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["myFoundItems", "foundItems", "matches", "notifications", "adminData"],
    }),
    getFoundItems: builder.query({
      query: (data: any) => {
        return {
          url: "/found-items",
          method: "GET",
          params: data,
        };
      },
      providesTags: ["foundItems"],
    }),
    getSingleFoundItem: builder.query({
      query: (id: string) => {
        return {
          url: `/found-item/${id}`,
          method: "GET",
        };
      },
    }),
    editMyFoundItem: builder.mutation({
      query: (data: any) => {
        return {
          url: `/my/foundItem`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["myFoundItems", "foundItems"],
    }),
    deleteMyFoundItem: builder.mutation({
      query: (id: string) => {
        return {
          url: `/my/foundItem/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["myFoundItems", "foundItems"],
    }),

    // change password
    changePassword: builder.mutation({
      query: (data: any) => {
        return {
          url: `/change-password`,
          method: "POST",
          body: data,
        };
      },
    }),
    // change email
    changeEmail: builder.mutation({
      query: (data: any) => {
        return {
          url: `/change-email`,
          method: "POST",
          body: data,
        };
      },
    }),
    // change username
    changeUsername: builder.mutation({
      query: (data: any) => {
        return {
          url: `/change-username`,
          method: "POST",
          body: data,
        };
      },
    }),

    // create claim
    createClaim: builder.mutation({
      query: (data: any) => {
        return {
          url: `/claims`,
          method: "POST",
          body: data,
        };
      },
    }),
    // my claim
    myClaims: builder.query({
      query: () => {
        return {
          url: `/my/claims`,
          method: "GET",
        };
      },
    }),
    // admin stats
    adminStats: builder.query({
      query: () => {
        return {
          url: `/admin/stats`,
          method: "GET",
        };
      },
      // providesTags: ["adminData"],
    }),
    // admin stats
    blockUser: builder.mutation({
      query: (id: string) => {
        return {
          url: `/block/user/${id}`,
          method: "PUT",
        };
      },
      invalidatesTags: ["users"],
    }),

    // change user role
    changeUserRole: builder.mutation({
      query: ({ id, role }: { id: string; role: string }) => {
        return {
          url: `/change-role/${id}`,
          method: "PUT",
          body: { role },
        };
      },
      invalidatesTags: ["users"],
    }),

    // soft delete user
    softDeleteUser: builder.mutation({
      query: (id: string) => {
        return {
          url: `/delete-user/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["users"],
    }),

    // get all users
    getAllUsers: builder.query({
      query: () => {
        return {
          url: "/users",
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),

    // get all claims (admin)
    getAllClaims: builder.query({
      query: () => {
        return {
          url: "/claims",
          method: "GET",
        };
      },
      providesTags: ["adminData"],
    }),

    // update claim status
    updateClaimStatus: builder.mutation({
      query: ({ claimId, ...data }: any) => {
        return {
          url: `/claims/${claimId}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["adminData"],
    }),

    // mark lost item as found
    markLostItemAsFound: builder.mutation({
      query: (data: any) => {
        return {
          url: "/found-lost",
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["mylostItems", "foundItems"],
    }),

    // testimonials/reviews
    getTestimonials: builder.query({
      query: () => {
        return {
          url: "/testimonials",
          method: "GET",
        };
      },
      providesTags: ["testimonials"],
    }),
    createTestimonial: builder.mutation({
      query: (data: any) => {
        return {
          url: "/testimonials",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["testimonials"],
    }),

    // services
    getServices: builder.query({
      query: () => {
        return {
          url: "/services",
          method: "GET",
        };
      },
      providesTags: ["services"],
    }),
    createService: builder.mutation({
      query: (data: any) => {
        return {
          url: "/services",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["services"],
    }),

    // faqs
    getFaqs: builder.query({
      query: () => {
        return {
          url: "/faqs",
          method: "GET",
        };
      },
      providesTags: ["faqs"],
    }),
    createFaq: builder.mutation({
      query: (data: any) => {
        return {
          url: "/faqs",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["faqs"],
    }),

    bulkImportCsv: builder.mutation({
      query: (file: File) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/admin/bulk-import", method: "POST", body };
      },
      invalidatesTags: ["adminData", "matches", "notifications"],
    }),

    getPublicStats: builder.query({
      query: () => ({ url: "/public/stats", method: "GET" }),
      providesTags: ["adminData"],
    }),
    getRecoveredItems: builder.query({
      query: () => ({ url: "/recovered-items", method: "GET" }),
      providesTags: ["recoveredItems"],
    }),

    getMyMatches: builder.query({
      query: () => ({ url: "/ai-matches", method: "GET" }),
      providesTags: ["matches"],
    }),

    getAiMatchesForFound: builder.query({
      query: (id: string) => ({ url: `/ai-matches/found/${id}`, method: "GET" }),
      providesTags: ["matches"],
    }),
    getAiMatchesForLost: builder.query({
      query: (id: string) => ({ url: `/ai-matches/lost/${id}`, method: "GET" }),
      providesTags: ["matches"],
    }),
    getOwnershipChallenge: builder.query({
      query: (matchId: string) => ({ url: `/ai-matches/${matchId}/challenge`, method: "GET" }),
    }),
    verifyOwnership: builder.mutation({
      query: ({ matchId, answers }: { matchId: string; answers: string[] }) => ({
        url: `/ai-matches/${matchId}/verify`, method: "POST", body: { answers },
      }),
      invalidatesTags: ["matches", "notifications", "adminData"],
    }),
    startHandover: builder.mutation({
      query: (matchId: string) => ({ url: `/ai-matches/${matchId}/handover`, method: "POST" }),
      invalidatesTags: ["matches", "notifications", "adminData"],
    }),
    confirmHandover: builder.mutation({
      query: ({ matchId, otp }: { matchId: string; otp: string }) => ({
        url: `/ai-matches/${matchId}/received`, method: "POST", body: { otp },
      }),
      invalidatesTags: ["matches", "notifications", "adminData", "recoveredItems"],
    }),

    getNotifications: builder.query({
      query: () => ({ url: "/notifications", method: "GET" }),
      providesTags: ["notifications"],
    }),
    markNotificationRead: builder.mutation({
      query: (id: string) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["notifications"],
    }),

    // recent activity for dashboard
    getRecentActivity: builder.query({
      query: () => {
        return {
          url: "/recent-activity",
          method: "GET",
        };
      },
      providesTags: ["recentActivity"],
    }),

    // AI search
    aiSearch: builder.mutation({
      query: (data: { query: string; type?: "ALL" | "LOST" | "FOUND"; location?: string; category?: string; dateFrom?: string; dateTo?: string }) => {
        return {
          url: "/ai-search",
          method: "POST",
          body: data,
        };
      },
    }),
  }),
});

export const {
  useGetLostItemsQuery,
  useLoginMutation,
  useRegistersMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateLostItemMutation,
  useGetSingleLostItemQuery,
  useCreateFoundItemMutation,
  useGetFoundItemsQuery,
  useGetSingleFoundItemQuery,
  useChangePasswordMutation,
  useChangeEmailMutation,
  useChangeUsernameMutation,
  useCreateClaimMutation,
  useMyClaimsQuery,
  useGetMyLostItemQuery,
  useEditMyLostItemMutation,
  useDeleteMyLostItemMutation,
  useGetMyFoundItemQuery,
  useDeleteMyFoundItemMutation,
  useEditMyFoundItemMutation,
  useAdminStatsQuery,
  useBlockUserMutation,
  useChangeUserRoleMutation,
  useSoftDeleteUserMutation,
  useGetAllUsersQuery,
  useGetAllClaimsQuery,
  useUpdateClaimStatusMutation,
  useMarkLostItemAsFoundMutation,
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useGetRecentActivityQuery,
  useGetPublicStatsQuery,
  useGetRecoveredItemsQuery,
  useBulkImportCsvMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetMyMatchesQuery,
  useLazyGetAiMatchesForFoundQuery,
  useLazyGetAiMatchesForLostQuery,
  useLazyGetOwnershipChallengeQuery,
  useVerifyOwnershipMutation,
  useStartHandoverMutation,
  useConfirmHandoverMutation,
  useAiSearchMutation,
} = api;
