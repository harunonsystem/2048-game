# Suggested Commands

## Running the Game
Since this is a client-side web application, there are no build commands required:

1. **Start the game**: Open `index.html` in a web browser
   ```bash
   open index.html  # macOS
   ```

2. **Live development server** (optional):
   ```bash
   # Using Python's built-in server
   python3 -m http.server 8000
   # Then open http://localhost:8000 in browser
   
   # Using Node's http-server (if installed)
   npx http-server . -p 8000
   ```

## Development Commands
Since this project uses vanilla HTML/CSS/JS without build tools:

- **No build step required**
- **No package management** - all dependencies are vanilla web technologies
- **No linting/formatting** - project doesn't include ESLint or Prettier configs
- **No automated tests** - currently no test framework implemented

## Git Commands
Standard git workflow for this project:
```bash
git add .
git commit -m "description"
git push origin develop
```

## System Commands (macOS)
- `ls -la` - List directory contents
- `find . -name "*.js"` - Find JavaScript files
- `grep -r "pattern" .` - Search for patterns in files