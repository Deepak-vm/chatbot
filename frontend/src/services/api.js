import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Send a user message and receive the full response (non-streaming).
 */
export const sendMessage = async (conversationId, message, model) => {
  const { data } = await apiClient.post('/api/chat', {
    conversation_id: conversationId,
    message,
    model,
  });
  return data;
};

/**
 * Stream a user message via SSE.
 *
 * @param {string}   conversationId
 * @param {string}   message
 * @param {string}   model
 * @param {(token: string) => void}                         onToken     – each streamed LLM token
 * @param {(name: string, input: object) => void}           onToolStart – tool call began
 * @param {(name: string, output: string) => void}          onToolEnd   – tool call finished
 * @param {(conversationId: string) => void}                onDone      – stream complete
 * @param {(error: string) => void}                         onError     – on error
 * @returns {() => void} abort function — call to cancel the stream
 */
export const streamMessage = (
  conversationId,
  message,
  model,
  onToken,
  onToolStart,
  onToolEnd,
  onDone,
  onError,
) => {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, message, model }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        onError(`Server error ${response.status}: ${text}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE lines separated by \n\n; each starts with "data: "
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep incomplete last chunk

        for (const line of lines) {
          const dataPart = line.startsWith('data: ') ? line.slice(6) : line;
          if (!dataPart.trim()) continue;

          try {
            const parsed = JSON.parse(dataPart);

            if (parsed.error) {
              onError(parsed.error);
            } else if (parsed.done) {
              onDone(parsed.conversation_id);
            } else if (parsed.token !== undefined) {
              onToken(parsed.token);
            } else if (parsed.tool_start !== undefined) {
              onToolStart(parsed.tool_start, parsed.input ?? {});
            } else if (parsed.tool_end !== undefined) {
              onToolEnd(parsed.tool_end, parsed.output ?? '');
            }
          } catch {
            // Ignore malformed JSON lines
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err.message || 'Stream connection failed');
      }
    }
  })();

  return () => controller.abort();
};

export const getConversations = async () => {
  const { data } = await apiClient.get('/api/conversations');
  return data;
};

export const getConversation = async (conversationId) => {
  const { data } = await apiClient.get(`/api/conversations/${conversationId}`);
  return data;
};

export const createConversation = async (title) => {
  const { data } = await apiClient.post('/api/conversations', { title });
  return data;
};

export const deleteConversation = async (conversationId) => {
  await apiClient.delete(`/api/conversations/${conversationId}`);
};

export const renameConversation = async (conversationId, title) => {
  const { data } = await apiClient.patch(`/api/conversations/${conversationId}`, { title });
  return data;
};
