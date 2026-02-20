/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { ChangeEvent, useRef, useState } from "react";
import { ConversationType, FileType, RequestPayload } from "./types";
import { GrAdd } from "react-icons/gr";
import { FcDocument } from "react-icons/fc";
import { CloudinaryUpload } from "./utils/files";
import Skeleton from "./component/skeleton";
import { apiFetch } from "./helper/api";
import { v4 as uuid } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { BiCopy } from "react-icons/bi";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [file, setFile] = useState<FileType | null>(null);
    const [messages, setMessages] = useState<ConversationType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(prompt);
        setPrompt("");
    };

    const handleRequest = async (payload: RequestPayload) => {
        const userId = uuid();
        const user: ConversationType = {
            id: userId,
            message: prompt,
            role: "user",
        };
        setMessages((prev) => [...prev, user]);
        // const res = await apiFetch(
        //     "http://localhost:8000/llm",
        //     "POST",
        //     payload
        // );
        const res = await fetch("http://localhost:8000/rag", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        console.log("Res", res);
        if (!res?.body) return;
        const assistId = uuid();
        setMessages((prev) => [...prev, { id: assistId, message: "" }]);
        const decoder = new TextDecoder();
        let decodeChunk = "";
        let fullText = "";
        for await (const chunk of res.body) {
            decodeChunk = decoder.decode(chunk);
            fullText += decodeChunk;
            console.log(fullText);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistId
                        ? {
                              ...msg,
                              id: assistId,
                              message: msg.message + decodeChunk,
                              role: "assistant",
                          }
                        : msg
                )
            );
        }
    };

    const handleFileupload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | undefined = e.target.files?.[0];
        if (file) {
            console.log("still inside");
            setLoading(true);
            const payload = await CloudinaryUpload(file);
            console.log("payload", payload);
            setFile(payload);
            e.target.value = "";
            setLoading(false);
        }
    };

    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const fileTypes = ["png", "jpg"];

    const codeRef = useRef<HTMLModElement | null>(null);
    const codeRefs = useRef<Record<string, HTMLElement>>({});
    const handleCopy = async () => {
        if (codeRef.current) {
            await navigator.clipboard.writeText(
                codeRef.current.textContent || ""
            );
        }
    };

    return (
        <div className="">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col w-full h-screen justify-between"
            >
                {/* messages */}
                <div className="w-full h-full  p-5 overflow-y-auto custom-scrollbar">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex  w-full ${
                                msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`p-2  rounded-xl mt-2 ${
                                    msg.role === "user"
                                        ? "items-end justify-end bg-red-500"
                                        : "justify-start bg-gray-900 w-full"
                                }`}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ children }) => (
                                            <p className="leading-relaxed text-white">
                                                {children}
                                            </p>
                                        ),

                                        h1: ({ children }) => (
                                            <h1 className="text-2xl font-bold my-3 text-purple-400">
                                                {children}
                                            </h1>
                                        ),

                                        h2: ({ children }) => (
                                            <h2 className="text-xl font-semibold my-2 text-purple-300">
                                                {children}
                                            </h2>
                                        ),

                                        h3: ({ children }) => (
                                            <h3 className="text-lg font-semibold my-2 text-purple-200">
                                                {children}
                                            </h3>
                                        ),

                                        strong: ({ children }) => (
                                            <strong className=" font-bold text-white">
                                                {children}
                                            </strong>
                                        ),

                                        em: ({ children }) => (
                                            <em className="italic text-green-400">
                                                {children}
                                            </em>
                                        ),

                                        a: ({ href, children }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 underline hover:text-blue-300"
                                            >
                                                {children}
                                            </a>
                                        ),

                                        ul: ({ children }) => (
                                            <ul className="list-disc pl-6 my-2 text-white space-y-1">
                                                {children}
                                            </ul>
                                        ),

                                        ol: ({ children }) => (
                                            <ol className="list-decimal pl-6 my-2 text-white space-y-1">
                                                {children}
                                            </ol>
                                        ),

                                        li: ({ children }) => (
                                            <li className="ml-5 text-white">
                                                {children}
                                            </li>
                                        ),

                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-3">
                                                {children}
                                            </blockquote>
                                        ),

                                        hr: () => (
                                            <hr className="border-gray-600 my-4" />
                                        ),

                                        pre: ({ children }) => (
                                            <pre className="bg-black/80 p-4 rounded-lg overflow-x-auto my-3 text-sm">
                                                {children}
                                            </pre>
                                        ),

                                        code: ({
                                            className,
                                            children,
                                            ...props
                                        }) => {
                                            const codeId = uuid();
                                            const isBlock =
                                                className?.includes(
                                                    "language-"
                                                );

                                            return isBlock ? (
                                                <pre className="relative ebg-black/80 p-4 rounded-lg overflow-x-auto my-3 text-sm">
                                                    <span className="absolute top-0 right-0">
                                                        <BiCopy
                                                            size={20}
                                                            onClick={() => {
                                                                const text =
                                                                    codeRefs
                                                                        .current[
                                                                        codeId
                                                                    ]
                                                                        ?.textContent ||
                                                                    "";
                                                                navigator.clipboard.writeText(
                                                                    text
                                                                );
                                                            }}
                                                        />
                                                    </span>
                                                    <code
                                                        className="text-blue-400"
                                                        ref={(el) => {
                                                            if (el)
                                                                codeRefs.current[
                                                                    codeId
                                                                ] = el;
                                                        }}
                                                    >
                                                        {children}
                                                    </code>
                                                </pre>
                                            ) : (
                                                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-red-400 text-sm">
                                                    {children}
                                                </code>
                                            );
                                        },
                                    }}
                                >
                                    {msg.message}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
                <input
                    ref={fileUploadRef}
                    type="file"
                    aria-label="file_upload"
                    className="hidden"
                    onChange={(e) => {
                        handleFileupload(e);
                        console.log("YES");
                    }}
                ></input>
                <div className="flex w-full gap-2 relative bg-black/0 p-5">
                    <div className="flex top-1/2 left-8 -translate-y-1/2  absolute">
                        <GrAdd
                            onClick={() => {
                                fileUploadRef.current?.click();
                            }}
                            size={20}
                            className="hover:scale-110 transition-all"
                        />
                    </div>
                    <div
                        className={`absolute  left-2 ${
                            file?.format === "pdf" ? "-top-15" : "-top-28"
                        }`}
                    >
                        <Skeleton isLoading={loading}>
                            <div
                                className={`${
                                    file?.format === "pdf"
                                        ? "h-auto w-full"
                                        : "h-[100px] w-full"
                                }`}
                            >
                                {fileTypes.includes(file?.format ?? "") && (
                                    <>
                                        <img
                                            src={file?.url}
                                            width={100}
                                            height={100}
                                            alt="upload file"
                                            className="w-full h-full object-contain rounded-2xl border"
                                        />
                                    </>
                                )}
                                {file?.format === "pdf" && (
                                    // <iframe
                                    //     aria-label="pdf viewer"
                                    //     src={file.url}
                                    //     width={100}
                                    //     height={100}
                                    //     className="w-full"
                                    // ></iframe>
                                    <FcDocument
                                        size={50}
                                        className="border rounded-xl p-2"
                                    />
                                )}
                            </div>
                        </Skeleton>
                    </div>
                    <input
                        aria-label="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="border p-2 rounded-2xl w-full pl-8 "
                    />
                    <button
                        onClick={() =>
                            handleRequest({ prompt, url: file?.url })
                        }
                        type="submit"
                        className="border p-2 rounded-xl hover:scale-110 transition-all"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
