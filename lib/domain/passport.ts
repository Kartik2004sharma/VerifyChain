import type { ProductMetadata } from "./metadata";
export type Verdict =
  | "registered"
  | "revoked"
  | "not_found"
  | "integrity_mismatch"
  | "unavailable"
  | "invalid_input";
export type Passport = {
  status: Verdict;
  productId: string;
  message: string;
  checkedAt: string;
  chainId: 11155111;
  block?: string;
  contract?: string;
  name?: string;
  manufacturer?: {
    address: string;
    companyName: string;
    active: boolean;
    trust: "self_registered";
  };
  commitment?: string;
  uri?: string;
  metadata?: ProductMetadata;
  integrity?: "match" | "mismatch" | "unavailable";
  registeredAt?: number;
  registrationBlock?: string;
  transactionHash?: string | null;
};
export const labels: Record<Verdict, string> = {
  registered: "Registered on Sepolia",
  revoked: "Registration revoked",
  not_found: "Record not found",
  integrity_mismatch: "Metadata mismatch",
  unavailable: "Verification unavailable",
  invalid_input: "Check the product ID",
};
export function verdict(
  active: boolean,
  integrity: Passport["integrity"],
): Verdict {
  return !active
    ? "revoked"
    : integrity === "mismatch"
      ? "integrity_mismatch"
      : "registered";
}
