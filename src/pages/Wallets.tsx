import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useTemplateStore } from "../stores/templateStore";
import { useWalletStore } from "../stores/walletStore";

export function WalletsPage() {
  const [newWalletName, setNewWalletName] = useState("");
  const { templates } = useTemplateStore();
  const { wallets, activeWalletId, addWallet, deleteWallet, setActiveWallet, setWalletTemplate } = useWalletStore();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Create Wallet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row">
          <Input
            value={newWalletName}
            onChange={(event) => setNewWalletName(event.target.value)}
            placeholder="Ex: Long Term, Trading, Crypto"
          />
          <Button
            onClick={() => {
              if (newWalletName.trim().length < 2) {
                return;
              }
              addWallet(newWalletName.trim());
              setNewWalletName("");
            }}
          >
            Add Wallet
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{wallet.name}</span>
                <span className="text-xs font-medium text-zinc-500">
                  {wallet.id === activeWalletId ? "Active" : "Inactive"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Associated Template</p>
                <Select
                  value={wallet.templateId ?? ""}
                  onChange={(event) => setWalletTemplate(wallet.id, event.target.value || undefined)}
                >
                  <option value="">No dedicated template (uses global active template)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={wallet.id === activeWalletId ? "default" : "secondary"}
                  onClick={() => setActiveWallet(wallet.id)}
                >
                  {wallet.id === activeWalletId ? "Current Wallet" : "Switch to Wallet"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteWallet(wallet.id)}
                  disabled={wallets.length <= 1}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
