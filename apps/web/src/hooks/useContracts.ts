import type { AnalysisResult, Clause, Contract, ContractType } from "@lexguard/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useContracts = () => {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data } = await api.get<{ contracts: Contract[] }>("/contracts");
      return data.contracts;
    },
  });
};

// Fetch a single contract
export const useContract = (id: string) => {
  return useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data } = await api.get(`/contracts/${id}`);
      return data.contract as Contract;
    },
    enabled: !!id,
  });
};

export const useAnalysisStatus = (contractId: string) => {
  return useQuery({
    queryKey: ["analysis-status", contractId],
    queryFn: async () => {
      const { data } = await api.get(`/analysis/${contractId}/status`);
      return data as { status: string; progress: number; currentStage: string };
    },
    enabled: !!contractId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && !["done", "failed", "completed"].includes(status)) {
        return 3000;
      }
      return false;
    },
  });
};

export const useAnalysisResult = (contractId: string) => {
  return useQuery({
    queryKey: ["analysis-result", contractId],
    queryFn: async () => {
      const { data } = await api.get(`/analysis/${contractId}/result`);
      return data as AnalysisResult;
    },
    enabled: !!contractId,
  });
};

export const useClauses = (contractId: string) => {
  return useQuery({
    queryKey: ["clauses", contractId],
    queryFn: async () => {
      const { data } = await api.get(`/clauses/contracts/${contractId}/clauses`);
      return data.clauses as Clause[];
    },
    enabled: !!contractId,
  });
};

export const useUploadContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      title?: string;
      contractType?: ContractType;
      jurisdiction?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", input.file);
      if (input.title) formData.append("title", input.title);
      if (input.contractType) formData.append("contractType", input.contractType);
      if (input.jurisdiction) formData.append("jurisdiction", input.jurisdiction);
      const { data } = await api.post<{ contractId: string; status: "processing" }>(
        "/contracts/upload",
        formData,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export const useImportUrl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { url: string; title?: string; contractType?: ContractType }) => {
      const { data } = await api.post<{ contractId: string; status: "processing" }>(
        "/contracts/import-url",
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};
