import type { ChatMessageInput, ChatResponse } from "@lexguard/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "../env";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth.store";

export const useChatHistory = (contractId: string) => {
  return useQuery({
    queryKey: ["chat", contractId],
    queryFn: async () => {
      const { data } = await api.get<{ messages: unknown[] }>(`/chat/${contractId}/history`);
      return data.messages;
    },
    enabled: !!contractId,
  });
};

export const useSendMessage = (contractId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const input: ChatMessageInput = { message };
      const response = await fetch(`${env.VITE_API_URL}/chat/${contractId}/message`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(useAuthStore.getState().accessToken
            ? { Authorization: `Bearer ${useAuthStore.getState().accessToken}` }
            : {}),
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }
      return parseSseChatResponse(await response.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", contractId] });
    },
  });
};

function parseSseChatResponse(text: string): ChatResponse {
  const messageLine = text
    .split("\n")
    .find((line) => line.startsWith("data:") && line.includes('"answer"'));
  if (!messageLine) {
    throw new Error("Chat response did not include an answer event");
  }
  return JSON.parse(messageLine.replace(/^data:\s*/, "")) as ChatResponse;
}
