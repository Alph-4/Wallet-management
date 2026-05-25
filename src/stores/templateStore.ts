
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Template } from "../types";
import { saveDoc, deleteDocFS, syncCollection } from "../lib/firestoreSync";


interface TemplateState {
  templates: Template[];
  activeTemplateId: string | null;
  addTemplate: (name: string, categories: Category[]) => Promise<void>;
  updateTemplate: (templateId: string, patch: Partial<Omit<Template, "id">>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  setActiveTemplate: (templateId: string) => void;
  getActiveTemplate: () => Template | null;
  getTemplateById: (templateId?: string) => Template | null;
  syncFromFirestore: (uid: string) => Promise<void>;
  setUser: (user: any) => void;
}

const localUid = () => Math.random().toString(36).slice(2, 10);

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
    (set, get) => {
      let currentUid: string | null = null;
      return {
        templates: [defaultTemplate],
        activeTemplateId: defaultTemplate.id,
        addTemplate: async (name, categories) => {
          const now = new Date().toISOString();
          const userId = currentUid;
          const template: Template = {
            id: localUid(),
            name,
            categories,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            templates: [...state.templates, template],
            activeTemplateId: state.activeTemplateId ?? template.id,
          }));
          if (userId) await saveDoc(userId, "templates", template);
        },
        updateTemplate: async (templateId, patch) => {
          set((state) => {
            const updated = state.templates.map((template) =>
              template.id === templateId
                ? { ...template, ...patch, updatedAt: new Date().toISOString() }
                : template,
            );
            if (currentUid) {
              const changed = updated.find((t) => t.id === templateId);
              if (changed) saveDoc(currentUid, "templates", changed);
            }
            return { templates: updated };
          });
        },
        deleteTemplate: async (templateId) => {
          set((state) => {
            const templates = state.templates.filter((template) => template.id !== templateId);
            const activeTemplateId =
              state.activeTemplateId === templateId && templates.length > 0
                ? templates[0].id
                : state.activeTemplateId;
            return {
              templates,
              activeTemplateId,
            };
          });
          if (currentUid) await deleteDocFS(currentUid, "templates", templateId);
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
        syncFromFirestore: async (uid: string) => {
          currentUid = uid;
          await syncCollection(uid, "templates", get().templates, (arr) => set({ templates: arr }));
        },
        setUser: (user: any) => {
          if (user?.uid) get().syncFromFirestore(user.uid);
        },
      };
    },
    {
      name: "rebalance-template-store",
    },
  ),
);
