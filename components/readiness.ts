"use client";
import { useQuery } from "@tanstack/react-query";
export function useReadiness() {
  return useQuery({
    queryKey: ["verifychain", "sepolia", "readiness"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/health/ready");
        return response.ok;
      } catch {
        return false;
      }
    },
    staleTime: 10000,
    retry: false,
    refetchOnWindowFocus: false,
  }).data;
}
