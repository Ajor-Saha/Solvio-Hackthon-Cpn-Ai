"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import useAuthStore from "@/store/store";
import {
  BookOpen,
  Bot,
  Download,
  File,
  FileCheck,
  FileText,
  Lightbulb,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Trash2,
  Upload,
  User,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: string[]; // Referenced papers for this response
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  pageCount?: number;
}

const suggestedPrompts = [
  {
    icon: <Search className="w-4 h-4" />,
    title: "Summarize paper",
    prompt: "Can you provide a summary of the key findings in my uploaded research papers?"
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: "Methodology",
    prompt: "What research methodologies are used in the uploaded papers?"
  },
  {
    icon: <Lightbulb className="w-4 h-4" />,
    title: "Key insights",
    prompt: "What are the main contributions and innovations in these papers?"
  },
  {
    icon: <FileText className="w-4 h-4" />,
    title: "Compare research",
    prompt: "Can you compare the approaches used in different papers?"
  }
];

export default function ResearchAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file =>
      file.type === 'application/pdf' ||
      file.name.endsWith('.pdf')
    );

    if (validFiles.length === 0) {
      alert('Please upload PDF files only');
      return;
    }

    // Simulate file upload and processing
    validFiles.forEach(file => {
      const newDoc: UploadedDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'processing',
      };

      setUploadedDocuments(prev => [...prev, newDoc]);

      // Simulate processing
      setTimeout(() => {
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.id === newDoc.id
              ? { ...doc, status: 'ready', pageCount: Math.floor(Math.random() * 20) + 5 }
              : doc
          )
        );
      }, 2000);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Create a placeholder message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const hasDocuments = uploadedDocuments.filter(doc => doc.status === 'ready').length > 0;
    const sources = hasDocuments ? uploadedDocuments.slice(0, 2).map(doc => doc.name) : undefined;

    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      sources: sources
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Use fetch for SSE streaming
      const accessToken = useAuthStore.getState().accessToken;

      const response = await fetch('http://localhost:8000/api/ai/research-assistant/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                accumulatedText += parsed.text;

                // Update the message with accumulated text
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: accumulatedText }
                    : msg
                ));
              }

              if (parsed.done) {
                console.log('✅ Streaming complete');
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete JSON
              if (data !== '') {
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsLoading(false);

      // Update the placeholder message with error
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
              ...msg,
              content: `Sorry, I encountered an error: ${error.message || 'Failed to get response'}. Please try again.`
            }
          : msg
      ));
    }
  };  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Research Assistant - RAG Chatbot
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload papers and ask questions about your research
              </p>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Research Assistant
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Upload your research papers and I'll help you understand, analyze, and extract insights from them.
              </p>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestedPrompts.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-indigo-300 dark:hover:border-indigo-600 group"
                    onClick={() => handleSuggestedPrompt(suggestion.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {suggestion.prompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {uploadedDocuments.length === 0 && (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload research papers from the sidebar to get started →
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`${
                      message.role === 'user'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {message.role === 'user' ? (user?.firstName || 'You') : 'Research Assistant'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {message.role === 'user' ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {message.content}
                        </div>
                      ) : (
                        <>
                          <div className="prose dark:prose-invert max-w-none prose-sm">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 mt-3">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-2">
                                    {children}
                                  </h2>
                                ),
                                p: ({ children }) => (
                                  <p className="text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside space-y-1 mb-2 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside space-y-1 mb-2 text-gray-700 dark:text-gray-300">
                                    {children}
                                  </ol>
                                ),
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  ) : (
                                    <code className={className}>{children}</code>
                                  );
                                },
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900 dark:text-gray-100">
                                    {children}
                                  </strong>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-start gap-2">
                                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Referenced Sources:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {message.sources.map((source, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Analyzing documents...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    uploadedDocuments.filter(d => d.status === 'ready').length > 0
                      ? "Ask me anything about your research papers..."
                      : "Upload research papers first, then ask questions..."
                  }
                  className="min-h-[60px] max-h-[150px] resize-none pr-12 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="absolute right-2 bottom-2 h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-3 h-3" />
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{messages.length} messages</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{uploadedDocuments.filter(d => d.status === 'ready').length} papers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Document Upload & Management */}
      <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Research Papers
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Drop PDF files here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Upload className="w-3 h-3 mr-1" />
              Choose Files
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-8">
                <File className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No documents uploaded yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Upload PDF research papers to start
                </p>
              </div>
            ) : (
              uploadedDocuments.map((doc) => (
                <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      doc.status === 'ready'
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : doc.status === 'processing'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {doc.status === 'ready' ? (
                        <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : doc.status === 'processing' ? (
                        <Upload className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
                      ) : (
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(doc.size)}
                        </span>
                        {doc.pageCount && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.pageCount} pages
                            </span>
                          </>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-2 ${
                          doc.status === 'ready'
                            ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                            : doc.status === 'processing'
                            ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400'
                            : 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400'
                        }`}
                      >
                        {doc.status === 'ready' ? 'Ready' : doc.status === 'processing' ? 'Processing...' : 'Error'}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      {doc.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        {uploadedDocuments.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
              <p className="text-xs text-indigo-800 dark:text-indigo-200 font-medium mb-1">
                💡 Tips for better results:
              </p>
              <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                <li>• Upload multiple papers to compare findings</li>
                <li>• Ask specific questions about methodologies</li>
                <li>• Request summaries of key contributions</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
