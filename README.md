# microterminal

microterminal is toy-like project acting as lightweight HTML terminal interface allowing users to access their computer remotely via WebSocket. 

It supports a limited set of system commands within a sandboxed directory, ensuring a secure, minimalistic command-line experience.

## Features

- **Remote Access**: Interact with your computer's terminal through a WebSocket interface.
- **Command Limiting**: Only a predefined set of commands is available for execution.
- **Sandboxed Directory**: File operations are isolated within a unique temporary directory to prevent unauthorized file access.
- **Process Control**: Start, stop, or kill processes initiated within the session.

## Getting Started

1. **Clone the repository** and install dependencies.
2. **Set up environment** (optional):

```bash
export PORT=3000  # Default port is 3000
```

3.	Run the server:
    ```bash
node server.js
```

## Usage

- Open `index.html` in your browser.
- This will establish a WebSocket connection to your server (default port: `ws://localhost:3000`).
- Execute Commands

```json
{ "command": "ls" }
```

## Client-side Commands

- View Available Commands: `help`
- Stop a Running Command: `stop` or `kill`
- To disconnect from actual session: `exit`

## Server Commands

- Basic: `ls, pwd, cat, echo, date, whoami, ps`
- Directory management: `mkdir, cd`
- Network commands: `ping, dig, host, nslookup, ifconfig`
- File management: `head, tail`

## Security

microterminal runs each session in a separate temporary directory, with command access limited to a list of safe commands to protect system integrity. However, it's not my responsibility to ensure the security of your system. Use this tool at your own risk locally or in a controlled environment.
