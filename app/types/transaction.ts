export interface TransactionStatus {
  signature: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  error?: string;
}
