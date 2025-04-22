import * as React from "react";
import { cn } from "../lib/utils";

export function NotionContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto px-4 py-6 bg-background flex flex-col min-h-[calc(100vh-64px)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NotionHeader({ title, description, className, ...props }) {
  return (
    <div className={cn("mb-8", className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function NotionPage({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-6 pb-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NotionSection({ title, children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        className
      )}
      {...props}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

export function NotionDivider({ className, ...props }) {
  return (
    <div
      className={cn("h-px w-full bg-border my-6", className)}
      {...props}
    />
  );
} 