const WebSocket = require("ws");
const { exec, execSync, spawn } = require("child_process");

const port = process.env.PORT || 3000;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port });

// Allowed commands for security
const ALLOWED_COMMANDS = [
  "ls",
  "pwd",
  "cat",
  "echo",
  "date",
  "whoami",
  "ps",
  "mkdir",
  "cd",
  "ping",
  "top",
  "head",
  "tail",
  // dns commands
  "dig",
  "host",
  "nslookup",
  // network commands
  "ifconfig",
];

// Sandbox directory for file operations
const SANDBOX_DIR = `/tmp/sandbox-${Math.random().toString(36).substring(7)}`;

wss.on("listening", () => {
  process.stdout.write(`${port} > Server started on port ${port}\n`);
});

wss.on("connection", (ws) => {
  let currentProcess = null;
  process.stdout.write(`${port} > Client connected\n`);

  // Create sandbox directory before connection start
  execSync(`mkdir -p ${SANDBOX_DIR}`);

  process.stdout.write(`${port} > ${SANDBOX_DIR} directory created \n`);

  // Set working directory to sandbox
  process.chdir(SANDBOX_DIR);

  ws.on("message", async (message) => {
    try {
      const { command } = JSON.parse(message);

      // split multiple commands sent by the client using && operator
      const commands = command.split("&&");

      for (let i = 0; i < commands.length; i++) {
        const [cmd, ...args] = command.split(" ");

        process.stdout.write(`${port} > Received command: ${command}\n`);

        if (cmd === "help") {
          ws.send(
            JSON.stringify({
              type: "output",
              output: `server:${port} > Allowed commands: ${ALLOWED_COMMANDS.join(", ")}`,
            }),
          );

          return;
        }

        // Add this to the message handler:
        if (cmd === "stop" || cmd === "kill") {
          if (currentProcess) {
            currentProcess.kill();

            ws.send(
              JSON.stringify({
                type: "system",
                output: "Process terminated by user",
              }),
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "system",
                output: "No process running",
              }),
            );
          }
          return;
        }

        // Security check
        if (!ALLOWED_COMMANDS.includes(cmd)) {
          ws.send(
            JSON.stringify({
              type: "error",
              output: `server:${port} > Command not allowed for security reasons.`,
            }),
          );
          return;
        }

        // Kill any existing process before starting a new one
        if (currentProcess) {
          currentProcess.kill();
        }

        // Spawn the process
        currentProcess = spawn(cmd, args);

        // Stream stdout
        currentProcess.stdout.on("data", (data) => {
          ws.send(
            JSON.stringify({
              type: "output",
              output: data.toString(),
            }),
          );
        });

        // Stream stderr
        currentProcess.stderr.on("data", (data) => {
          ws.send(
            JSON.stringify({
              type: "error",
              output: data.toString(),
            }),
          );
        });

        // Handle process exit
        currentProcess.on("exit", (code) => {
          ws.send(
            JSON.stringify({
              type: "system",
              output: `Process exited with code ${code}`,
            }),
          );
        });

        // Handle process errors
        currentProcess.on("error", (error) => {
          ws.send(
            JSON.stringify({
              type: "error",
              output: `Failed to start process: ${error.message}`,
            }),
          );
        });
      }
    } catch (error) {
      console.error(error);
      ws.send(
        JSON.stringify({
          type: "error",
          output: `server:${port} > Invalid command.\n`,
        }),
      );
    }
  });

  ws.on("close", () => {
    process.stdout.write(`${port} > Client disconnected\n`);

    if (currentProcess) {
      currentProcess.kill();
    }

    exec(`rm -rf ${SANDBOX_DIR}`);
  });
});
