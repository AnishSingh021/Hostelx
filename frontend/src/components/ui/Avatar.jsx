import React from "react";
import { cn } from "../../lib/utils";

export const Avatar = React.forwardRef(({ src, alt, fallback, className, ...props }, ref) => {
  const [error, setError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted", className)}
      {...props}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm font-medium uppercase">
          {fallback || alt?.charAt(0) || "U"}
        </div>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

