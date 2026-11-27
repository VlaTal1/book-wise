import apiRequest, {ApiResponse, getApiBaseUrl} from "@/api";
import {getAuthHeaders} from "@/auth/actingStudent";
import {ReadingSpeedAttempt} from "@/types/ReadingSpeed";

const readingSpeedAttemptApi = {
    getById: async (id: number): Promise<ApiResponse<ReadingSpeedAttempt>> => {
        return apiRequest<ReadingSpeedAttempt>({
            path: `/api/reading-speed-attempts/${id}`,
            method: "GET",
        });
    },

    getHistory: async (participantId: string): Promise<ApiResponse<ReadingSpeedAttempt[]>> => {
        return apiRequest<ReadingSpeedAttempt[]>({
            path: `/api/reading-speed-attempts/participant/${participantId}`,
            method: "GET",
        });
    },

    getAllHistory: async (): Promise<ApiResponse<ReadingSpeedAttempt[]>> => {
        return apiRequest<ReadingSpeedAttempt[]>({
            path: "/api/reading-speed-attempts",
            method: "GET",
        });
    },

    submitQuizResult: async ({id, correct}: {
        id: number;
        correct: number;
    }): Promise<ApiResponse<ReadingSpeedAttempt>> => {
        return apiRequest<ReadingSpeedAttempt>({
            path: `/api/reading-speed-attempts/${id}/quiz`,
            method: "POST",
            body: {correct},
            headers: {
                "Accept": "application/json",
            },
        });
    },

    deleteAttempt: async (id: number): Promise<ApiResponse<null>> => {
        return apiRequest<null>({
            path: `/api/reading-speed-attempts/${id}`,
            method: "DELETE",
            responseType: "none",
        });
    },

    getAudioSource: async (id: number): Promise<{ uri: string; headers: Record<string, string> }> => {
        return {
            uri: `${getApiBaseUrl()}/api/reading-speed-attempts/${id}/audio`,
            headers: await getAuthHeaders(),
        };
    },
};

export default readingSpeedAttemptApi;
