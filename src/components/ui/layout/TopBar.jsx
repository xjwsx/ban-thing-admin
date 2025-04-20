import React from "react";
import { Search, Settings, User } from "lucide-react";

const TopBar = () => {
  return (
    <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-lg">
          <div className="flex items-center px-4 h-10 rounded-lg border border-input bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="flex-1 ml-2 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Type a command or search..."
            />
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-accent rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-accent rounded-lg">
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
