"use client";

import { useEffect } from "react";
import { storeAuthNextPath } from "@/lib/auth/auth-next";

type Props = { next?: string };

export function SignupNextCapture({ next }: Props) {
  useEffect(() => {
    if (next?.startsWith("/")) storeAuthNextPath(next);
  }, [next]);
  return null;
}
