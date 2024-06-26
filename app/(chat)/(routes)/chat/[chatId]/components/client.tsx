"use client";
import { useCompletion } from "ai/react";
import { FormEvent, useState } from "react";
import { Companion, Message } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";
import { responseToChatBlocks } from "@/components/ChatBlock";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Sparkles } from "lucide-react";
import { useProModal } from "@/hooks/use-pro-modal";
interface ChatClientProps {
  isPro: boolean;
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    }
  };
};
export const ChatClient = ({
  isPro,
  companion,
}: ChatClientProps) => {
  const proModal = useProModal();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages.map(message => ({
      role: message.role as "user" | "system",
    content: responseToChatBlocks(message.content)
  })));
  const {
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
    setInput,
  } = useCompletion({
    api: `/api/chat/${companion.id}`,
    onFinish(_prompt, completion) {
      const systemMessage: ChatMessageProps = {
        role: "system",
        content: responseToChatBlocks(completion)
      };
      setMessages((current) => [...current, systemMessage]);
      setInput("");
      router.refresh();
    },
  });
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: "user",
      content: responseToChatBlocks(input)
    };
    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  }
  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader isPro={isPro} companion={companion}  />

      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />

      <ChatForm
        isPro={isPro}
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        companion={companion}
        onSubmit={onSubmit}
      />
    </div>
  );
};