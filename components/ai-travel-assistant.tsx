"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  User,
  Loader2,
  MapPin,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AITravelAssistantProps {
  route: { from: string; to: string } | null;
  destinationCountry: any;
  checklist: any;
  routeData: any;
  safetyReports: any[];
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent, options?: any) => void;
  isLoading: boolean;
  append: (message: any, options?: any) => void;
  createSystemContext: () => string;
}

export function AITravelAssistant({
  route,
  destinationCountry,

  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  append,
  createSystemContext,
}: AITravelAssistantProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Hide quick questions after first user message
  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");
    if (userMessages.length > 0) {
      setShowQuickQuestions(false);
    }
  }, [messages]);

  const handleQuickQuestion = (question: string) => {
    append(
      {
        role: "user",
        content: question,
      },
      {
        body: {
          systemContext: createSystemContext(),
        },
      }
    );
    setShowQuickQuestions(false);
  };

  if (!route || !destinationCountry) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Travel Assistant</h3>
          <p className="text-gray-600">
            Please select your travel route to start chatting with your AI
            assistant.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chat Messages and Input Combined */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="h-[500px] px-6">
            <div className="space-y-4">
              {messages.length > 0 &&
                messages.map((message, index) => {
                  // Ensure we have a valid message object
                  if (
                    !message ||
                    typeof message !== "object" ||
                    !message.content
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={`msg-${index}-${message.id || Date.now()}`}
                      className={`flex gap-10 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.role === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        } items-start space-x-3`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 gap-2 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-blue-600 text-white "
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl mr-2 px-4 py-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {String(message.content)
                              .split("\n")
                              .map((line, lineIndex) => (
                                <span key={`line-${lineIndex}`}>
                                  {line}
                                  {lineIndex <
                                    String(message.content).split("\n").length -
                                      1 && <br />}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Questions - Show only if no user messages yet */}
              {showQuickQuestions && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Quick Questions:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-3 text-left justify-start hover:bg-gray-50"
                      onClick={() =>
                        handleQuickQuestion(
                          "What documents do I need for this trip?"
                        )
                      }
                      disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">What documents do I need?</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-3 text-left justify-start hover:bg-gray-50"
                      onClick={() =>
                        handleQuickQuestion(
                          "What are the current safety conditions?"
                        )
                      }
                      disabled={isLoading}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        Current safety conditions?
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-3 text-left justify-start hover:bg-gray-50"
                      onClick={() =>
                        handleQuickQuestion(
                          "What should I pack for this destination?"
                        )
                      }
                      disabled={isLoading}
                    >
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">What should I pack?</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-3 text-left justify-start hover:bg-gray-50"
                      onClick={() =>
                        handleQuickQuestion(
                          "Tell me about local customs and culture"
                        )
                      }
                      disabled={isLoading}
                    >
                      <Bot className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">Local customs & culture?</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Chat Input - Fixed at bottom */}
          <div className="p-4 border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;

                handleSubmit(e, {
                  body: {
                    systemContext: createSystemContext(),
                  },
                });
              }}
              className="flex space-x-3"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about your trip..."
                className="flex-1 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
