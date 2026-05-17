import { create } from "zustand";

interface ContractState {
  selectedContractId: string | null;
  highlightedClauseId: string | null;
  setSelectedContract: (id: string | null) => void;
  setHighlight: (clauseId: string | null) => void;
}

export const useContractStore = create<ContractState>((set) => ({
  selectedContractId: null,
  highlightedClauseId: null,
  setSelectedContract: (id) => set({ selectedContractId: id }),
  setHighlight: (clauseId) => set({ highlightedClauseId: clauseId }),
}));
