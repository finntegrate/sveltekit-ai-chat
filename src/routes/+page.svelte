<script>
    import { Chat } from '@ai-sdk/svelte';
  
    const chat = new Chat();
  </script>
  
  <div class="min-h-screen bg-base-200">
    <!-- Header -->
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <h1 class="text-xl font-bold">AI Chat Assistant</h1>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="container mx-auto max-w-4xl p-4">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body h-[70vh] flex flex-col">
          <!-- Messages Area -->
          <div class="flex-1 overflow-y-auto space-y-4 mb-4">
            {#if chat.messages.length === 0}
              <div class="text-center text-base-content/60 py-8">
                <div class="text-4xl mb-4">💬</div>
                <p class="text-lg">Start a conversation with your AI assistant</p>
                <p class="text-sm">Ask questions, get help, or just chat!</p>
              </div>
            {/if}
            
            {#each chat.messages as message, messageIndex (messageIndex)}
              <div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'}">
                <div class="chat-image avatar">
                  <div class="w-16 h-16 bg-{message.role === 'user' ? 'primary' : 'secondary'} flex items-center justify-center">
                    <span class="text-white text-xl font-bold">
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                  </div>
                </div>
                <div class="chat-header">
                  <span class="text-sm opacity-50 capitalize">{message.role}</span>
                </div>
                <div class="chat-bubble {message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}">
                  {#each message.parts as part, partIndex (partIndex)}
                    {#if part.type === 'text'}
                      <div class="whitespace-pre-wrap">{part.text}</div>
                    {:else if part.type === 'tool-invocation'}
                      <div class="mockup-code mt-2">
                        <pre class="text-xs"><code>{JSON.stringify(part.toolInvocation, null, 2)}</code></pre>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <!-- Input Form -->
          <div class="border-t pt-4">
            <form onsubmit={chat.handleSubmit} class="flex gap-2">
              <div class="flex-1">
                <input 
                  bind:value={chat.input} 
                  placeholder="Type your message here..."
                  class="input input-bordered w-full"
                  disabled={chat.isLoading}
                />
              </div>
              <button 
                type="submit" 
                class="btn btn-primary"
                disabled={chat.isLoading || !chat.input?.trim()}
              >
                {#if chat.isLoading}
                  <span class="loading loading-spinner loading-sm"></span>
                  Sending...
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                {/if}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>