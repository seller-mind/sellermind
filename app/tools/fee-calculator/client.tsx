"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, TrendingUp, ArrowRight, RotateCcw } from "lucide-react";

const LISTING_FEE = 0.2;
const TRANSACTION_RATE = 0.065;
const PAYMENT_RATE = 0.03;
const PAYMENT_FIXED = 0.25;

function fmt(n: number) {
  return n.toFixed(2);
}

function InputRow({
  label,
  value,
  onChange,
  prefix,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.replace(/\s/g, "-").toLowerCase()} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={label.replace(/\s/g, "-").toLowerCase()}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={prefix ? "pl-7" : ""}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultRow({
  label,
  value,
  isNegative,
  isBold,
}: {
  label: string;
  value: string;
  isNegative?: boolean;
  isBold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={isBold ? "font-semibold" : "text-muted-foreground text-sm"}>
        {label}
      </span>
      <span
        className={
          isBold
            ? "font-bold text-lg"
            : isNegative
            ? "text-red-600 font-medium"
            : "font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function FeeCalculatorClient() {
  const [price, setPrice] = React.useState("25.00");
  const [quantity, setQuantity] = React.useState("1");
  const [shipping, setShipping] = React.useState("5.00");
  const [materials, setMaterials] = React.useState("8.00");
  const [shippingLabel, setShippingLabel] = React.useState("0");

  const n = (v: string) => parseFloat(v) || 0;

  const qty = Math.max(1, Math.floor(n(quantity)));
  const salePrice = n(price) * qty;
  const totalSale = salePrice + n(shipping);

  const listingFee = LISTING_FEE * qty;
  const transactionFee = totalSale * TRANSACTION_RATE;
  const paymentFee = totalSale * PAYMENT_RATE + PAYMENT_FIXED;
  const labelCost = n(shippingLabel);
  const totalFees = listingFee + transactionFee + paymentFee + labelCost;

  const profit = totalSale - totalFees - n(materials);
  const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;
  const profitColor =
    profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-yellow-600";

  const handleReset = () => {
    setPrice("25.00");
    setQuantity("1");
    setShipping("5.00");
    setMaterials("8.00");
    setShippingLabel("0");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          <Calculator className="w-4 h-4" />
          100% Free · No Sign-up
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Etsy Fee &amp; Profit Calculator
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          Know exactly what Etsy takes and what you keep. Enter your numbers below
          to see the full fee breakdown instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Your Product Details
            </CardTitle>
            <CardDescription>
              Based on US Etsy fees (2026). Adjust for your country if different.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <InputRow
              label="Item Price"
              value={price}
              onChange={setPrice}
              prefix="$"
              placeholder="25.00"
            />
            <InputRow
              label="Quantity per Order"
              value={quantity}
              onChange={setQuantity}
              placeholder="1"
            />
            <InputRow
              label="Shipping (buyer pays)"
              value={shipping}
              onChange={setShipping}
              prefix="$"
              placeholder="5.00"
            />
            <InputRow
              label="Materials Cost"
              value={materials}
              onChange={setMaterials}
              prefix="$"
              placeholder="8.00"
              hint="Your cost to make or source the item"
            />
            <InputRow
              label="Etsy Shipping Label (optional)"
              value={shippingLabel}
              onChange={setShippingLabel}
              prefix="$"
              placeholder="0.00"
              hint="Cost if you buy labels through Etsy"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-full text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={profit < 0 ? "border-red-200 bg-red-50/30" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Your Profit Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Revenue */}
            <div className="pb-2 border-b">
              <ResultRow label={`Total Sale (item + shipping)`} value={`$${fmt(totalSale)}`} isBold />
            </div>

            {/* Fees */}
            <div className="py-2 border-b space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Etsy Fees
              </p>
              <ResultRow label={`Listing fee ($${LISTING_FEE} x ${qty})`} value={`-$${fmt(listingFee)}`} isNegative />
              <ResultRow label={`Transaction fee (${(TRANSACTION_RATE * 100).toFixed(1)}%)`} value={`-$${fmt(transactionFee)}`} isNegative />
              <ResultRow label={`Payment processing (${(PAYMENT_RATE * 100).toFixed(0)}% + $${PAYMENT_FIXED})`} value={`-$${fmt(paymentFee)}`} isNegative />
              {labelCost > 0 && (
                <ResultRow label="Shipping label" value={`-$${fmt(labelCost)}`} isNegative />
              )}
              <div className="flex justify-between pt-1.5 border-t mt-1">
                <span className="text-sm font-medium">Total Etsy Fees</span>
                <span className="font-bold text-red-600">-${fmt(totalFees)}</span>
              </div>
            </div>

            {/* Costs */}
            <div className="py-2 border-b">
              <ResultRow label="Materials cost" value={`-$${fmt(n(materials))}`} isNegative />
            </div>

            {/* Profit */}
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Your Profit</span>
                <span className={`text-2xl font-bold ${profitColor}`}>
                  {profit >= 0 ? "" : "-"}${fmt(Math.abs(profit))}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className={`font-semibold ${profitColor}`}>{fmt(margin)}%</span>
              </div>
            </div>

            {profit < 0 && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  {"You're losing money on this sale. Consider raising your price or reducing costs."}
                </p>
              </div>
            )}
            {profit >= 0 && margin < 20 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {`Thin margin (${fmt(margin)}%). Most successful Etsy sellers aim for 30%+ profit margin.`}
                </p>
              </div>
            )}
            {margin >= 20 && margin < 40 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Decent margin. Optimize your listing SEO to sell more at this price.
                </p>
              </div>
            )}
            {margin >= 40 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  {"Excellent margin! You have room to invest in marketing and grow."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Etsy Fee Structure Reference (2026)</CardTitle>
          <CardDescription>
            How each fee is calculated — US marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 w-20 shrink-0">$0.20</span>
                <div>
                  <span className="font-medium">Listing Fee</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Charged per item when you publish or renew a listing. Lasts 4 months or until sold.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 w-20 shrink-0">6.5%</span>
                <div>
                  <span className="font-medium">Transaction Fee</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Applied to the total sale price including item, shipping, and gift wrap.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 w-20 shrink-0">3%+$0.25</span>
                <div>
                  <span className="font-medium">Payment Processing</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    US Etsy Payments rate. Other countries vary. Includes a $0.25 fixed fee.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 w-20 shrink-0">Varies</span>
                <div>
                  <span className="font-medium">Shipping Label</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Optional. If you buy USPS, FedEx, or Canada Post labels through Etsy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="py-8 text-center space-y-3">
          <h3 className="text-xl font-bold">Want to Sell More on Etsy?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {`SellerMind generates SEO-optimized titles, all 13 tags, and keyword-rich descriptions for your listings. Get found in Etsy search and increase your sales.`}
          </p>
          <Button asChild size="lg">
            <Link href="/tools/listing">
              Try Free Listing Generator <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            3 free AI uses per month · No credit card required
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pb-8">
        {`Fee rates based on Etsy's US marketplace as of January 2026. Actual fees may vary by country. See `}
        <a
          href="https://www.etsy.com/legal/seller-accounts/payments"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {"Etsy's official fee page"}
        </a>
        .
      </p>
    </div>
  );
}
