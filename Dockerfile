FROM denoland/deno:2.3.3

WORKDIR /app

COPY supabase/functions/ ./functions/

EXPOSE 8000

# Serve a specific function; replace with the desired entry point
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "functions/wladbot-chat/index.ts"]
