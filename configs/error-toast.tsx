"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

export function ErrorToast({ children }: Props) {
  const searchParams = useSearchParams();
  
  // State to track error
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam); // Set error from query params
    }
  }, [searchParams]); // Re-run when searchParams changes

  React.useEffect(() => {
    if (error) {
      toast.error(error); // Show toast when error exists
    }
  }, [error]); // Only show toast when error changes

  return <>{children}</>;
}
