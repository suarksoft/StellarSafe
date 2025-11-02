export interface ContractInfo {
  contractName: string;
  wasmHash: string;
  wasmSize: number;
  sourceHash: string;
  sourceFiles: string[];
  gitCommit?: string;
  gitRemote?: string;
  gitBranch?: string;
  rustVersion?: string;
  sorobanVersion?: string;
  timestamp: number;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface VerificationResponse {
  success: boolean;
  verified?: boolean;
  checks?: VerificationCheck[];
  contractId?: string;
  message?: string;
  error?: string;
}

export interface GitInfo {
  commit?: string;
  remote?: string;
  branch?: string;
}

export interface BuildInfo {
  rustVersion?: string;
  sorobanVersion?: string;
}

