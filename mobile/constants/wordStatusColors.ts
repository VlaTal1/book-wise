import {WordStatus} from "@/types/ReadingSpeed";

export const WORD_STATUS_COLORS: Record<WordStatus, string> = {
    correct: "#BFE5C2",
    error: "#F5B3AC",
    skipped: "#FFD966",
    not_in_vocabulary: "#BBD3F2",
    not_reached: "#DCDCDC",
};

export const WORD_TEXT_COLOR = "$gray-20";

export const WORD_TENTATIVE_BACKGROUND = "#ECECEC";

export const WORD_STATUS_LEGEND_ORDER: WordStatus[] = [
    "correct",
    "error",
    "skipped",
    "not_in_vocabulary",
    "not_reached",
];

export const WORD_STATUS_LABEL_KEYS: Record<WordStatus, string> = {
    correct: "word_status_correct",
    error: "word_status_error",
    skipped: "word_status_skipped",
    not_in_vocabulary: "word_status_not_in_vocabulary",
    not_reached: "word_status_not_reached",
};

export const STRESS_ERROR_UNDERLINE_COLOR = "#7C3AED";
