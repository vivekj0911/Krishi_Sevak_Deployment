import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import botIcon from '../../assets/chatbotimg.png';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    // Initialize Gemini once
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    console.log("API Key length:", API_KEY?.length);
    
    if (!API_KEY) {
        console.error("No API key found in environment variables");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // List available models on component mount
    useEffect(() => {
        const listModels = async () => {
            try {
                console.log("Listing available models...");
                const models = await genAI.listModels();
                console.log("Available models:", models);
            } catch (error) {
                console.error("Error listing models:", error);
            }
        };
        
        listModels();
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            console.log('Using gemini-1.5-pro model...');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContent(input);
            const response = await result.response;
            const text = response.text();
            
            setMessages((prev) => [...prev, { from: "bot", text: text || "No response." }]);
        } catch (error) {
            console.error("Error talking to Gemini:", error);
            let errorMessage = "Oops, something went wrong! 😵";
            
            if (error.message.includes("API key not valid")) {
                errorMessage = "API key error. Please check your configuration.";
            } else if (error.message.includes("quota")) {
                errorMessage = "API quota exceeded. Please try again later.";
            } else if (error.message.includes("not found")) {
                errorMessage = "Model not found. Please check your API configuration.";
            }
            
            setMessages((prev) => [...prev, { from: "bot", text: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            handleSend();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatRef.current && !chatRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* Chat Toggle Button */}
            <div className="fixed bottom-24 right-6 z-50">
                <button
                    className="bg-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <img src={botIcon} alt="Chatbot Icon" className="w-12 h-12 object-contain" />
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-50"
                >
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 font-bold flex items-center justify-between">
                        <span>AgriBot 🌾</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-300 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`px-4 py-2 rounded-lg max-w-[70%] ${msg.from === "user"
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 max-w-[70%] animate-pulse">
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 flex items-center gap-2 border-t">
                        <input
                            type="text"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}