export type FileType = {
    public_id?: string;
    name?: string;
    url: string;
    format: string;
};

export type ConversationType = {
    id: string;
    message?: string;
    file?: FileType;
    role?: "user" | "assistant";
};

export type RequestPayload = {
    prompt: string;
    url?: string;
};
