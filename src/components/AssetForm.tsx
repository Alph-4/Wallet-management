import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import type { Asset, Category } from "../types";

interface AssetFormProps {
  categories: Category[];
  onSubmit: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void;
}

export function AssetForm({ categories, onSubmit }: AssetFormProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && categoryId.length > 0 && quantity > 0 && manualPrice >= 0;
  }, [name, categoryId, quantity, manualPrice]);

  return (
    <form
      className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) {
          return;
        }

        onSubmit({
          name: name.trim(),
          categoryId,
          ticker: ticker.trim() || undefined,
          quantity,
          manualPrice,
        });

        setName("");
        setTicker("");
        setQuantity(1);
        setManualPrice(0);
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" className="md:col-span-2" />
      <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="Ticker (optional)" />
      <Input
        type="number"
        min={0}
        step={0.0001}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        placeholder="Quantity"
      />
      <Input
        type="number"
        min={0}
        step={0.0001}
        value={manualPrice}
        onChange={(e) => setManualPrice(Number(e.target.value))}
        placeholder="Manual price"
      />
      <div className="md:col-span-6">
        <Button type="submit" disabled={!canSubmit}>
          Add Asset
        </Button>
      </div>
    </form>
  );
}
