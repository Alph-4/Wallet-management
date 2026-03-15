import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { Currency, RebalanceResult } from "../types";
import { calculateAsoScore } from "../lib/score";
import { AllocationBar } from "./AllocationBar";

interface RebalanceViewProps {
  result: RebalanceResult;
  currency: Currency;
}

const formatMoney = (value: number, currency: Currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

export function RebalanceView({ result, currency }: RebalanceViewProps) {
  const score = calculateAsoScore(result.categories);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Allocation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationBar categories={result.categories} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ASO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-zinc-900">{score}</div>
            <p className="mt-2 text-sm text-zinc-600">Health score based on maximum deviation from targets.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Current %</TableHead>
                <TableHead>Target %</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.categories.map((category) => (
                <TableRow key={category.categoryId}>
                  <TableCell className="font-medium">{category.categoryName}</TableCell>
                  <TableCell>{category.currentPercent.toFixed(2)}%</TableCell>
                  <TableCell>{category.targetPercent.toFixed(2)}%</TableCell>
                  <TableCell>{category.deviationPoints.toFixed(2)} pp</TableCell>
                  <TableCell>{category.action}</TableCell>
                  <TableCell>{formatMoney(category.actionAmount, currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Trades by Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.assetSuggestions.map((suggestion) => (
                <TableRow key={`${suggestion.assetId}-${suggestion.action}`}>
                  <TableCell className="font-medium">{suggestion.assetName}</TableCell>
                  <TableCell>{suggestion.action}</TableCell>
                  <TableCell>{formatMoney(suggestion.amount, currency)}</TableCell>
                </TableRow>
              ))}
              {result.assetSuggestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-zinc-500">
                    Portfolio is already aligned or missing data.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
