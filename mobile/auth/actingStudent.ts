import {getAccessToken} from "@/auth/supabase";

export const ACT_AS_HEADER = "X-Act-As-Participant";

let actingStudentId: number | null = null;

export const getActingStudentId = () => actingStudentId;

export const setActingStudentId = (id: number | null) => {
    actingStudentId = id;
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (actingStudentId !== null) {
        headers[ACT_AS_HEADER] = actingStudentId.toString();
    }
    return headers;
};
