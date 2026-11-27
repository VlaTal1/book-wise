import {Access} from "@/types/Access";

export type Book = {
    id: number;
    title: string;
    author: string;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    fileType: string;
    catalogKey?: string | null;
    accesses: Access[]
}

export type CatalogBook = {
    key: string;
    title: string;
    author: string;
    grade?: number;
}