import {Participant} from "@/types/Paticipant";
import {Book} from "@/types/Book";
import {GenerationStatus} from "@/types/Test";
import {ClassroomReading} from "@/types/ClassroomReading";

export type Classroom = {
    id: number;
    name: string;
    code: string;
    teacherName: string | null;
    studentsCount: number;
    targetWpm: number;
}

export type ClassroomTest = {
    id: number;
    bookId: number;
    bookTitle: string;
    startPage: number;
    endPage: number;
    questionsAmount: number;
    generationStatus: GenerationStatus;
    testsCount: number;
    completedCount: number;
}

export type ClassroomDetails = Classroom & {
    students: Participant[];
    books: Book[];
    tests: ClassroomTest[];
    readings?: ClassroomReading[];
}

export type ClassroomTestRequest = {
    bookId: number;
    startPage: number;
    endPage: number;
    questionsAmount: number;
}
