"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Guardar",
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={cn("space-y-4", className)}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        {state?.message && (
          <p className={cn("flex items-center gap-1.5 text-sm", state.ok ? "text-success" : "text-destructive")} role="status">
            {state.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            <span className="break-all">{state.message}</span>
          </p>
        )}
      </div>
    </form>
  );
}

export function ConfirmButton({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <button
      type="submit"
      className="btn-outline text-destructive hover:bg-destructive/10"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
