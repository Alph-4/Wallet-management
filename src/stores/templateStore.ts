import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Template } from "../types";

interface TemplateState {
  templates: Template[];
  activeTemplateId: string | null;
  addTemplate: (name: string, categories: Category[]) => void;
  updateTemplate: (templateId: string, patch: Partial<Omit<Template, "id">>) => void;
  deleteTemplate: (templateId: string) => void;
  setActiveTemplate: (templateId: string) => void;
  getActiveTemplate: () => Template | null;
  getTemplateById: (templateId?: string) => Template | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultTemplate: Template = {
  id: "template-default",
  name: "Default",
  categories: [
    { id: "cat-stocks", name: "Stocks", targetPercent: 40, color: "#2563eb" },
    { id: "cat-gold", name: "Gold", targetPercent: 25, color: "#d4a017" },
    { id: "cat-bonds", name: "Bonds", targetPercent: 25, color: "#059669" },
    { id: "cat-cash", name: "Cash", targetPercent: 10, color: "#6b7280" },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [defaultTemplate],
      activeTemplateId: defaultTemplate.id,
      addTemplate: (name, categories) => {
        const now = new Date().toISOString();
        const template: Template = {
          id: uid(),
          name,
          categories,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          templates: [...state.templates, template],
          activeTemplateId: state.activeTemplateId ?? template.id,
        }));
      },
      updateTemplate: (templateId, patch) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? { ...template, ...patch, updatedAt: new Date().toISOString() }
              : template,
          ),
        }));
      },
      deleteTemplate: (templateId) => {
        set((state) => {
          const templates = state.templates.filter((template) => template.id !== templateId);
          if (templates.length === 0) {
            return state;
          }

          const activeTemplateId =
            state.activeTemplateId === templateId ? templates[0].id : state.activeTemplateId;

          return {
            templates,
            activeTemplateId,
          };
        });
      },
      setActiveTemplate: (templateId) => set({ activeTemplateId: templateId }),
      getActiveTemplate: () => {
        const state = get();
        const active = state.templates.find((template) => template.id === state.activeTemplateId);
        return active ?? null;
      },
      getTemplateById: (templateId) => {
        if (!templateId) {
          return null;
        }
        const state = get();
        return state.templates.find((template) => template.id === templateId) ?? null;
      },
    }),
    {
      name: "rebalance-template-store",
    },
  ),
);
