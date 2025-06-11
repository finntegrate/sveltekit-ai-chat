<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';

  // Error state management with proper typing
  interface ErrorState {
    message: string;
    timestamp: Date;
    canRetry: boolean;
  }

  let lastError: ErrorState | null = null;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  // Initialize chat with error handling
  const chat = new Chat({
    onError: (error: any) => {
      console.error('Chat error:', error);
      lastError = {
        message: getErrorMessage(error),
        timestamp: new Date(),
        canRetry: retryCount < MAX_RETRIES
      };
    },
    onFinish: () => {
      // Reset error state on successful completion
      lastError = null;
      retryCount = 0;
    }
  });

  // Enhanced form submission with error handling
  async function handleFormSubmit(event: Event) {
    try {
      // Clear previous errors
      lastError = null;

      // Call the original handleSubmit
      await chat.handleSubmit(event);
    } catch (error) {
      console.error('Form submission error:', error);
      lastError = {
        message: getErrorMessage(error),
        timestamp: new Date(),
        canRetry: true
      };
    }
  }

  // Retry mechanism
  async function retryLastMessage() {
    if (!lastError?.canRetry || retryCount >= MAX_RETRIES) return;

    try {
      retryCount++;
      lastError = null;

      // Use the reload method to retry the last message
      await chat.reload();
    } catch (error) {
      console.error('Retry error:', error);
      lastError = {
        message: getErrorMessage(error),
        timestamp: new Date(),
        canRetry: retryCount < MAX_RETRIES
      };
    }
  }

  // Clear all errors and start fresh
  function clearError() {
    lastError = null;
    retryCount = 0;
  }

  // User-friendly error message formatter
  function getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';

    if (typeof error === 'string') return error;

    if (error.message) {
      // Handle specific error types with user-friendly messages
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return 'Too many requests. Please wait a moment before trying again.';
      }
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return 'Service quota exceeded. Please try again later.';
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network connection error. Please check your connection and try again.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
      }
      if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        return 'Authentication error. Please refresh the page and try again.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  // Check if chat is in loading state
  $: isLoading = chat.status === 'submitted' || chat.status === 'streaming';
</script>

<div class="bg-base-200 min-h-screen">
  <!-- Header -->
  <div class="navbar bg-base-100 shadow-lg">
    <div class="flex-1">
      <h1 class="text-xl font-bold">AI Chat Assistant</h1>
    </div>
  </div>

  <!-- Chat Container -->
  <div class="container mx-auto max-w-4xl p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body flex h-[70vh] flex-col">
        <!-- Messages Area -->
        <div class="mb-4 flex-1 space-y-4 overflow-y-auto">
          {#if chat.messages.length === 0}
            <div class="text-base-content/60 py-8 text-center">
              <div class="mb-4 text-4xl">💬</div>
              <p class="text-lg">Start a conversation with your AI assistant</p>
              <p class="text-sm">Ask questions, get help, or just chat!</p>
            </div>
          {/if}

          {#each chat.messages as message, messageIndex (messageIndex)}
            <div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'}">
              <div class="chat-image avatar">
                <div class="avatar-placeholder">
                  <div
                    class="{message.role === 'user'
                      ? 'bg-primary text-primary-content'
                      : 'bg-secondary text-secondary-content'} h-16 w-16 rounded-full"
                  >
                    <span class="text-2xl">
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                  </div>
                </div>
              </div>
              <div class="chat-header">
                <span class="text-sm capitalize opacity-50">{message.role}</span>
              </div>
              <div
                class="chat-bubble {message.role === 'user'
                  ? 'chat-bubble-primary'
                  : 'chat-bubble-secondary'}"
              >
                {#each message.parts as part, partIndex (partIndex)}
                  {#if part.type === 'text'}
                    <div class="whitespace-pre-wrap">{part.text}</div>
                  {:else if part.type === 'tool-invocation'}
                    <div class="mockup-code mt-2">
                      <pre class="text-xs"><code
                          >{JSON.stringify(part.toolInvocation, null, 2)}</code
                        ></pre>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}

          <!-- Error Display -->
          {#if lastError}
            <div class="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1">
                <div class="font-semibold">Error</div>
                <div class="text-sm">{lastError.message}</div>
                <div class="mt-1 text-xs opacity-70">
                  {lastError.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div class="flex gap-2">
                {#if lastError.canRetry}
                  <button
                    class="btn btn-sm btn-outline btn-error"
                    onclick={retryLastMessage}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Retry {retryCount > 0 ? `(${retryCount}/${MAX_RETRIES})` : ''}
                  </button>
                {/if}
                <button class="btn btn-sm btn-ghost" onclick={clearError}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Dismiss
                </button>
              </div>
            </div>
          {/if}

          <!-- Loading indicator for chat operations -->
          {#if isLoading}
            <div class="flex justify-center py-4">
              <div class="text-base-content/60 flex items-center gap-2">
                <span class="loading loading-dots loading-md"></span>
                <span class="text-sm">AI is thinking...</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- Input Form -->
        <div class="border-t pt-4">
          <form onsubmit={handleFormSubmit} class="flex gap-2">
            <div class="flex-1">
              <input
                bind:value={chat.input}
                placeholder="Type your message here..."
                aria-label="Type your message to send to the AI assistant"
                class="input input-bordered w-full {lastError ? 'input-error' : ''}"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              aria-label={isLoading
                ? 'Sending message to AI assistant'
                : 'Send message to AI assistant'}
              aria-describedby={lastError ? 'error-help-text' : undefined}
              aria-disabled={isLoading || !chat.input?.trim() || (lastError && !lastError.canRetry)}
              disabled={isLoading || !chat.input?.trim() || (lastError && !lastError.canRetry)}
              tabindex="0"
            >
              {#if isLoading}
                <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
                Sending...
              {:else}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send
              {/if}
            </button>
          </form>

          <!-- Error help text -->
          {#if lastError}
            <div class="text-error mt-2 px-1 text-xs" id="error-help-text">
              {#if lastError.canRetry}
                Use the retry button above or clear the error to try again.
              {:else if retryCount >= MAX_RETRIES}
                Maximum retry attempts reached. Please check your connection and try again later.
              {:else}
                Please clear the error and try again.
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
