import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import type { Asset, Category } from "../types";
import { ASSET_SUGGESTIONS, type AssetSuggestion } from "../lib/assetSuggestions";

interface AssetFormProps {
  categories: Category[];
  onSubmit: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
}

export function AssetForm({ categories, onSubmit }: AssetFormProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [manualPrice, setManualPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!categories.find((category) => category.id === categoryId)) {
      setCategoryId(categories[0]?.id ?? "");
    }
  }, [categories, categoryId]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && categoryId.length > 0 && quantity > 0 && manualPrice >= 0;
  }, [name, categoryId, quantity, manualPrice]);

  const filteredSuggestions = useMemo<AssetSuggestion[]>(() => {
    const query = `${name} ${ticker}`.trim().toLowerCase();
    if (!query) {
      return ASSET_SUGGESTIONS;
    }

    return ASSET_SUGGESTIONS.filter((item) => {
      return item.name.toLowerCase().includes(query) || item.ticker.toLowerCase().includes(query);
    }).slice(0, 10);
  }, [name, ticker]);

  const applySuggestion = (item: AssetSuggestion) => {
    setName(item.name);
    setTicker(item.ticker);
    if (item.kind === "Cash") {
      setQuantity(1);
    }
  };

  return (
    <form
      className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-6"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canSubmit || isSubmitting) {
          return;
        }

        setSubmitError(null);
        setIsSubmitting(true);

        try {
          await onSubmit({
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
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to add asset";
          setSubmitError(message);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="md:col-span-2">
        <Input
          value={name}
          onChange={(e) => {
            const nextName = e.target.value;
            setName(nextName);
            const matched = ASSET_SUGGESTIONS.find(
              (item) => item.name.toLowerCase() === nextName.trim().toLowerCase(),
            );
            if (matched) {
              setTicker(matched.ticker);
            }
          }}
          placeholder="Asset name"
          list="asset-name-suggestions"
        />
        <datalist id="asset-name-suggestions">
          {filteredSuggestions.map((item) => (
            <option key={`${item.name}-${item.ticker}`} value={item.name}>
              {item.ticker}
            </option>
          ))}
        </datalist>
      </div>
      <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <div>
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Ticker (optional)"
          list="asset-ticker-suggestions"
        />
        <datalist id="asset-ticker-suggestions">
          {filteredSuggestions
            .filter((item) => item.ticker)
            .map((item) => (
              <option key={`${item.ticker}-${item.name}`} value={item.ticker}>
                {item.name}
              </option>
            ))}
        </datalist>
      </div>
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
        <div className="mb-2 flex flex-wrap gap-2">
          {filteredSuggestions.slice(0, 8).map((item) => (
            <button
              key={`${item.name}-${item.ticker}-${item.kind}`}
              type="button"
              onClick={() => applySuggestion(item)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {item.name} {item.ticker ? `(${item.ticker})` : "(CASH)"}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Adding + fetching price..." : "Add Asset"}
        </Button>
        {submitError ? <p className="mt-2 text-sm text-red-600">{submitError}</p> : null}
        <p className="mt-2 text-xs text-zinc-500">
          Start typing name or ticker, then click a suggestion to autofill. If ticker is empty, manual price is used.
        </p>
      </div>
    </form>
  );
}
