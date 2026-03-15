import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Category, Template } from "../types";

interface TemplateEditorProps {
  templates: Template[];
  activeTemplateId: string | null;
  onAddTemplate: (name: string, categories: Category[]) => void;
  onSetActiveTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function TemplateEditor({
  templates,
  activeTemplateId,
  onAddTemplate,
  onSetActiveTemplate,
  onDeleteTemplate,
}: TemplateEditorProps) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState<Category[]>([
    { id: uid(), name: "Stocks", targetPercent: 40, color: "#2563eb" },
    { id: uid(), name: "Gold", targetPercent: 25, color: "#d4a017" },
    { id: uid(), name: "Bonds", targetPercent: 25, color: "#059669" },
    { id: uid(), name: "Cash", targetPercent: 10, color: "#6b7280" },
  ]);

  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.targetPercent || 0), 0), [rows]);

  const isValid = name.trim().length > 1 && rows.length > 0 && Math.abs(total - 100) < 0.001;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-2 md:grid-cols-12">
              <Input
                className="md:col-span-5"
                value={row.name}
                placeholder="Category"
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...next[index], name: e.target.value };
                  setRows(next);
                }}
              />
              <Input
                className="md:col-span-3"
                type="number"
                value={row.targetPercent}
                min={0}
                max={100}
                step={0.1}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...next[index], targetPercent: Number(e.target.value) };
                  setRows(next);
                }}
              />
              <Input
                className="md:col-span-2"
                type="color"
                value={row.color}
                onChange={(e) => {
                  const next = [...rows];
                  next[index] = { ...next[index], color: e.target.value };
                  setRows(next);
                }}
              />
              <Button
                className="md:col-span-2"
                type="button"
                variant="secondary"
                onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
                disabled={rows.length <= 1}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setRows((prev) => [...prev, { id: uid(), name: "", targetPercent: 0, color: "#3b82f6" }])
              }
            >
              Add Category
            </Button>
            <p className={`text-sm font-medium ${Math.abs(total - 100) < 0.001 ? "text-emerald-700" : "text-red-600"}`}>
              Total: {total.toFixed(2)}%
            </p>
          </div>
          <Button
            type="button"
            disabled={!isValid}
            onClick={() => {
              onAddTemplate(
                name,
                rows.map((row) => ({ ...row, id: row.id || uid() })),
              );
              setName("");
            }}
          >
            Save Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-900">{template.name}</p>
                  <p className="text-xs text-zinc-500">{template.categories.length} categories</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={template.id === activeTemplateId ? "default" : "secondary"}
                    onClick={() => onSetActiveTemplate(template.id)}
                  >
                    {template.id === activeTemplateId ? "Active" : "Use"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={templates.length <= 1}
                    onClick={() => onDeleteTemplate(template.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
