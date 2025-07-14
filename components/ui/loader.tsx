import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
}

export function Loader({
  size = "md",
  className,
  text = "読み込み中...",
  variant = "spinner",
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center space-y-2",
          className
        )}
      >
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
        </div>
        {text && (
          <p className={cn("text-muted-foreground", textSizes[size])}>{text}</p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center space-y-2",
          className
        )}
      >
        <div
          className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size]
          )}
        ></div>
        {text && (
          <p className={cn("text-muted-foreground", textSizes[size])}>{text}</p>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizes[size])}>{text}</p>
      )}
    </div>
  );
}

// ページ全体のローディング用コンポーネント
export function PageLoader({
  text = "ページを読み込み中...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[400px]",
        className
      )}
    >
      <Loader size="lg" text={text} />
    </div>
  );
}

// テーブルのローディング用コンポーネント
export function TableLoader({
  text = "データを読み込み中...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Loader size="md" text={text} />
    </div>
  );
}

// ボタンのローディング用コンポーネント
export function ButtonLoader({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

// カードのローディング用コンポーネント
export function CardLoader({
  text = "読み込み中...",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Loader size="lg" text={text} />
    </div>
  );
}
