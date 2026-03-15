import { TemplateEditor } from "../components/TemplateEditor";
import { useTemplateStore } from "../stores/templateStore";

export function TemplatesPage() {
  const { templates, activeTemplateId, addTemplate, setActiveTemplate, deleteTemplate } = useTemplateStore();

  return (
    <TemplateEditor
      templates={templates}
      activeTemplateId={activeTemplateId}
      onAddTemplate={addTemplate}
      onSetActiveTemplate={setActiveTemplate}
      onDeleteTemplate={deleteTemplate}
    />
  );
}
