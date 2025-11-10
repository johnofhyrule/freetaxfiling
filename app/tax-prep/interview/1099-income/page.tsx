"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getCurrentTaxReturn,
  saveTaxReturn,
} from "@/lib/tax-prep/storage";
import {
  Income1099INT,
  Income1099DIV,
  Income1099B,
  Income1099MISC,
} from "@/lib/tax-prep/types";

// Validation schemas
const income1099INTSchema = z.object({
  payerName: z.string().min(1, "Payer name is required"),
  payerEIN: z.string().optional(),
  interestIncome: z.number().min(0, "Cannot be negative"),
  earlyWithdrawalPenalty: z.number().min(0, "Cannot be negative").optional(),
  federalTaxWithheld: z.number().min(0, "Cannot be negative").optional(),
});

const income1099DIVSchema = z.object({
  payerName: z.string().min(1, "Payer name is required"),
  payerEIN: z.string().optional(),
  ordinaryDividends: z.number().min(0, "Cannot be negative"),
  qualifiedDividends: z.number().min(0, "Cannot be negative"),
  totalCapitalGainDistributions: z.number().min(0, "Cannot be negative").optional(),
  federalTaxWithheld: z.number().min(0, "Cannot be negative").optional(),
});

const income1099BSchema = z.object({
  brokerName: z.string().min(1, "Broker name is required"),
  description: z.string().min(1, "Description is required"),
  dateAcquired: z.string().min(1, "Date acquired is required"),
  dateSold: z.string().min(1, "Date sold is required"),
  proceeds: z.number().min(0, "Cannot be negative"),
  costBasis: z.number().min(0, "Cannot be negative"),
  shortTermOrLongTerm: z.enum(["short", "long"]),
});

const income1099MISCSchema = z.object({
  payerName: z.string().min(1, "Payer name is required"),
  payerEIN: z.string().optional(),
  nonemployeeCompensation: z.number().min(0, "Cannot be negative").optional(),
  rents: z.number().min(0, "Cannot be negative").optional(),
  royalties: z.number().min(0, "Cannot be negative").optional(),
  otherIncome: z.number().min(0, "Cannot be negative").optional(),
  federalTaxWithheld: z.number().min(0, "Cannot be negative").optional(),
});

type Income1099INTFormData = z.infer<typeof income1099INTSchema>;
type Income1099DIVFormData = z.infer<typeof income1099DIVSchema>;
type Income1099BFormData = z.infer<typeof income1099BSchema>;
type Income1099MISCFormData = z.infer<typeof income1099MISCSchema>;

type FormType = "INT" | "DIV" | "B" | "MISC";

export default function Income1099Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FormType>("INT");

  // State for each 1099 type
  const [forms1099INT, setForms1099INT] = useState<Income1099INT[]>([]);
  const [forms1099DIV, setForms1099DIV] = useState<Income1099DIV[]>([]);
  const [forms1099B, setForms1099B] = useState<Income1099B[]>([]);
  const [forms1099MISC, setForms1099MISC] = useState<Income1099MISC[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms for each type
  const formINT = useForm<Income1099INTFormData>({
    resolver: zodResolver(income1099INTSchema),
    defaultValues: {
      interestIncome: 0,
      earlyWithdrawalPenalty: 0,
      federalTaxWithheld: 0,
    },
  });

  const formDIV = useForm<Income1099DIVFormData>({
    resolver: zodResolver(income1099DIVSchema),
    defaultValues: {
      ordinaryDividends: 0,
      qualifiedDividends: 0,
      totalCapitalGainDistributions: 0,
      federalTaxWithheld: 0,
    },
  });

  const formB = useForm<Income1099BFormData>({
    resolver: zodResolver(income1099BSchema),
    defaultValues: {
      proceeds: 0,
      costBasis: 0,
      shortTermOrLongTerm: "short",
    },
  });

  const formMISC = useForm<Income1099MISCFormData>({
    resolver: zodResolver(income1099MISCSchema),
    defaultValues: {
      nonemployeeCompensation: 0,
      rents: 0,
      royalties: 0,
      otherIncome: 0,
      federalTaxWithheld: 0,
    },
  });

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setForms1099INT(taxReturn.form1040.interest1099INT || []);
    setForms1099DIV(taxReturn.form1040.dividends1099DIV || []);
    setForms1099B(taxReturn.form1040.capitalGains1099B || []);
    setForms1099MISC(taxReturn.form1040.misc1099 || []);
  }, [router]);

  const handleAdd1099INT = (data: Income1099INTFormData) => {
    const newForm: Income1099INT = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
    };

    const updatedForms = editingId
      ? forms1099INT.map((f) => (f.id === editingId ? newForm : f))
      : [...forms1099INT, newForm];

    setForms1099INT(updatedForms);
    saveToStorage("interest1099INT", updatedForms);
    resetForm();
  };

  const handleAdd1099DIV = (data: Income1099DIVFormData) => {
    const newForm: Income1099DIV = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
    };

    const updatedForms = editingId
      ? forms1099DIV.map((f) => (f.id === editingId ? newForm : f))
      : [...forms1099DIV, newForm];

    setForms1099DIV(updatedForms);
    saveToStorage("dividends1099DIV", updatedForms);
    resetForm();
  };

  const handleAdd1099B = (data: Income1099BFormData) => {
    const gainOrLoss = data.proceeds - data.costBasis;
    const newForm: Income1099B = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      gainOrLoss,
    };

    const updatedForms = editingId
      ? forms1099B.map((f) => (f.id === editingId ? newForm : f))
      : [...forms1099B, newForm];

    setForms1099B(updatedForms);
    saveToStorage("capitalGains1099B", updatedForms);
    resetForm();
  };

  const handleAdd1099MISC = (data: Income1099MISCFormData) => {
    const newForm: Income1099MISC = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
    };

    const updatedForms = editingId
      ? forms1099MISC.map((f) => (f.id === editingId ? newForm : f))
      : [...forms1099MISC, newForm];

    setForms1099MISC(updatedForms);
    saveToStorage("misc1099", updatedForms);
    resetForm();
  };

  const saveToStorage = (field: string, data: any) => {
    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      (taxReturn.form1040 as any)[field] = data;
      saveTaxReturn(taxReturn);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    formINT.reset();
    formDIV.reset();
    formB.reset();
    formMISC.reset();
  };

  const handleDelete = (type: FormType, id: string) => {
    if (!confirm(`Are you sure you want to remove this 1099-${type}?`)) return;

    switch (type) {
      case "INT":
        const updatedINT = forms1099INT.filter((f) => f.id !== id);
        setForms1099INT(updatedINT);
        saveToStorage("interest1099INT", updatedINT);
        break;
      case "DIV":
        const updatedDIV = forms1099DIV.filter((f) => f.id !== id);
        setForms1099DIV(updatedDIV);
        saveToStorage("dividends1099DIV", updatedDIV);
        break;
      case "B":
        const updatedB = forms1099B.filter((f) => f.id !== id);
        setForms1099B(updatedB);
        saveToStorage("capitalGains1099B", updatedB);
        break;
      case "MISC":
        const updatedMISC = forms1099MISC.filter((f) => f.id !== id);
        setForms1099MISC(updatedMISC);
        saveToStorage("misc1099", updatedMISC);
        break;
    }
  };

  const handleEdit = (type: FormType, item: any) => {
    setActiveTab(type);
    setIsAdding(true);
    setEditingId(item.id);

    switch (type) {
      case "INT":
        formINT.reset(item);
        break;
      case "DIV":
        formDIV.reset(item);
        break;
      case "B":
        formB.reset(item);
        break;
      case "MISC":
        formMISC.reset(item);
        break;
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (!taxReturn.progress.completedSections.includes("1099-income")) {
      taxReturn.progress.completedSections.push("1099-income");
    }
    taxReturn.progress.currentStep = 5;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/self-employment");
  };

  const totalInterest = forms1099INT.reduce((sum, f) => sum + f.interestIncome, 0);
  const totalDividends = forms1099DIV.reduce((sum, f) => sum + f.ordinaryDividends, 0);
  const totalCapitalGains = forms1099B.reduce((sum, f) => sum + f.gainOrLoss, 0);
  const totalMiscIncome = forms1099MISC.reduce(
    (sum, f) => sum + (f.nonemployeeCompensation || 0) + (f.rents || 0) + (f.royalties || 0) + (f.otherIncome || 0),
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">1099 Income</h1>
        <p className="mt-2 text-gray-600">
          Enter information from your 1099 forms for interest, dividends, stock sales, and other income.
        </p>
      </div>

      {/* Summary Cards */}
      {!isAdding && (forms1099INT.length > 0 || forms1099DIV.length > 0 || forms1099B.length > 0 || forms1099MISC.length > 0) && (
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-gray-600">Interest (1099-INT)</p>
            <p className="text-xl font-bold text-foreground">${totalInterest.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{forms1099INT.length} form(s)</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-gray-600">Dividends (1099-DIV)</p>
            <p className="text-xl font-bold text-foreground">${totalDividends.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{forms1099DIV.length} form(s)</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-gray-600">Capital Gains (1099-B)</p>
            <p className={`text-xl font-bold ${totalCapitalGains >= 0 ? 'text-success' : 'text-red-600'}`}>
              ${totalCapitalGains.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{forms1099B.length} transaction(s)</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-gray-600">Other (1099-MISC)</p>
            <p className="text-xl font-bold text-foreground">${totalMiscIncome.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{forms1099MISC.length} form(s)</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isAdding && (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            {[
              { type: "INT" as FormType, label: "1099-INT", count: forms1099INT.length },
              { type: "DIV" as FormType, label: "1099-DIV", count: forms1099DIV.length },
              { type: "B" as FormType, label: "1099-B", count: forms1099B.length },
              { type: "MISC" as FormType, label: "1099-MISC", count: forms1099MISC.length },
            ].map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`border-b-2 px-4 py-2 font-semibold transition-colors ${
                  activeTab === tab.type
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1099-INT Forms */}
      {activeTab === "INT" && !isAdding && (
        <div className="mb-8">
          {forms1099INT.length > 0 && (
            <div className="mb-6 space-y-4">
              {forms1099INT.map((form) => (
                <div key={form.id} className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{form.payerName}</h3>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                      <div>
                        <p className="font-medium text-gray-700">Interest Income (Box 1)</p>
                        <p className="text-foreground">${form.interestIncome.toLocaleString()}</p>
                      </div>
                      {form.earlyWithdrawalPenalty && form.earlyWithdrawalPenalty > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Early Withdrawal Penalty (Box 2)</p>
                          <p className="text-foreground">${form.earlyWithdrawalPenalty.toLocaleString()}</p>
                        </div>
                      )}
                      {form.federalTaxWithheld && form.federalTaxWithheld > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Federal Tax Withheld (Box 4)</p>
                          <p className="text-foreground">${form.federalTaxWithheld.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit("INT", form)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("INT", form.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1099-DIV Forms */}
      {activeTab === "DIV" && !isAdding && (
        <div className="mb-8">
          {forms1099DIV.length > 0 && (
            <div className="mb-6 space-y-4">
              {forms1099DIV.map((form) => (
                <div key={form.id} className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{form.payerName}</h3>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                      <div>
                        <p className="font-medium text-gray-700">Ordinary Dividends (Box 1a)</p>
                        <p className="text-foreground">${form.ordinaryDividends.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Qualified Dividends (Box 1b)</p>
                        <p className="text-foreground">${form.qualifiedDividends.toLocaleString()}</p>
                      </div>
                      {form.totalCapitalGainDistributions && form.totalCapitalGainDistributions > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Capital Gain Distributions (Box 2a)</p>
                          <p className="text-foreground">${form.totalCapitalGainDistributions.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit("DIV", form)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("DIV", form.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1099-B Forms */}
      {activeTab === "B" && !isAdding && (
        <div className="mb-8">
          {forms1099B.length > 0 && (
            <div className="mb-6 space-y-4">
              {forms1099B.map((form) => (
                <div key={form.id} className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{form.description}</h3>
                    <p className="text-sm text-gray-500">Broker: {form.brokerName}</p>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
                      <div>
                        <p className="font-medium text-gray-700">Date Acquired</p>
                        <p className="text-foreground">{form.dateAcquired}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Date Sold</p>
                        <p className="text-foreground">{form.dateSold}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Proceeds</p>
                        <p className="text-foreground">${form.proceeds.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Gain/Loss ({form.shortTermOrLongTerm}-term)</p>
                        <p className={form.gainOrLoss >= 0 ? 'text-success font-semibold' : 'text-red-600 font-semibold'}>
                          ${form.gainOrLoss.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit("B", form)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("B", form.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1099-MISC Forms */}
      {activeTab === "MISC" && !isAdding && (
        <div className="mb-8">
          {forms1099MISC.length > 0 && (
            <div className="mb-6 space-y-4">
              {forms1099MISC.map((form) => (
                <div key={form.id} className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{form.payerName}</h3>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                      {form.nonemployeeCompensation && form.nonemployeeCompensation > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Nonemployee Compensation</p>
                          <p className="text-foreground">${form.nonemployeeCompensation.toLocaleString()}</p>
                        </div>
                      )}
                      {form.rents && form.rents > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Rents</p>
                          <p className="text-foreground">${form.rents.toLocaleString()}</p>
                        </div>
                      )}
                      {form.royalties && form.royalties > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Royalties</p>
                          <p className="text-foreground">${form.royalties.toLocaleString()}</p>
                        </div>
                      )}
                      {form.otherIncome && form.otherIncome > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Other Income</p>
                          <p className="text-foreground">${form.otherIncome.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleEdit("MISC", form)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("MISC", form.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Form Button */}
      {!isAdding && (
        <div className="mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 font-semibold text-gray-700 hover:border-primary hover:text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add 1099-{activeTab}
          </button>
        </div>
      )}

      {/* Add/Edit Forms */}
      {isAdding && activeTab === "INT" && (
        <form onSubmit={formINT.handleSubmit(handleAdd1099INT)} className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {editingId ? "Edit 1099-INT" : "Add 1099-INT (Interest Income)"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer Name *</label>
              <input
                type="text"
                {...formINT.register("payerName")}
                placeholder="Bank or institution name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formINT.formState.errors.payerName && (
                <p className="mt-1 text-sm text-red-600">{formINT.formState.errors.payerName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer EIN (Optional)</label>
              <input
                type="text"
                {...formINT.register("payerEIN")}
                placeholder="XX-XXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Interest Income (Box 1) *</label>
              <input
                type="number"
                step="0.01"
                {...formINT.register("interestIncome", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formINT.formState.errors.interestIncome && (
                <p className="mt-1 text-sm text-red-600">{formINT.formState.errors.interestIncome.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Early Withdrawal Penalty (Box 2)</label>
              <input
                type="number"
                step="0.01"
                {...formINT.register("earlyWithdrawalPenalty", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Federal Tax Withheld (Box 4)</label>
              <input
                type="number"
                step="0.01"
                {...formINT.register("federalTaxWithheld", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90">
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isAdding && activeTab === "DIV" && (
        <form onSubmit={formDIV.handleSubmit(handleAdd1099DIV)} className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {editingId ? "Edit 1099-DIV" : "Add 1099-DIV (Dividend Income)"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer Name *</label>
              <input
                type="text"
                {...formDIV.register("payerName")}
                placeholder="Brokerage or company name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formDIV.formState.errors.payerName && (
                <p className="mt-1 text-sm text-red-600">{formDIV.formState.errors.payerName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer EIN (Optional)</label>
              <input
                type="text"
                {...formDIV.register("payerEIN")}
                placeholder="XX-XXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Ordinary Dividends (Box 1a) *</label>
              <input
                type="number"
                step="0.01"
                {...formDIV.register("ordinaryDividends", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formDIV.formState.errors.ordinaryDividends && (
                <p className="mt-1 text-sm text-red-600">{formDIV.formState.errors.ordinaryDividends.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Qualified Dividends (Box 1b) *</label>
              <input
                type="number"
                step="0.01"
                {...formDIV.register("qualifiedDividends", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Total Capital Gain Distributions (Box 2a)</label>
              <input
                type="number"
                step="0.01"
                {...formDIV.register("totalCapitalGainDistributions", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Federal Tax Withheld (Box 4)</label>
              <input
                type="number"
                step="0.01"
                {...formDIV.register("federalTaxWithheld", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90">
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isAdding && activeTab === "B" && (
        <form onSubmit={formB.handleSubmit(handleAdd1099B)} className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {editingId ? "Edit 1099-B" : "Add 1099-B (Stock Sale)"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Broker Name *</label>
              <input
                type="text"
                {...formB.register("brokerName")}
                placeholder="Brokerage name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formB.formState.errors.brokerName && (
                <p className="mt-1 text-sm text-red-600">{formB.formState.errors.brokerName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description *</label>
              <input
                type="text"
                {...formB.register("description")}
                placeholder="e.g., 100 shares of AAPL"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formB.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">{formB.formState.errors.description.message}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Date Acquired *</label>
                <input
                  type="date"
                  {...formB.register("dateAcquired")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Date Sold *</label>
                <input
                  type="date"
                  {...formB.register("dateSold")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Proceeds (Sales Price) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...formB.register("proceeds", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Cost Basis (Purchase Price) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...formB.register("costBasis", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Short-term or Long-term *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="short"
                    {...formB.register("shortTermOrLongTerm")}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Short-term (held ≤1 year)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="long"
                    {...formB.register("shortTermOrLongTerm")}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Long-term (held &gt;1 year)</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90">
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isAdding && activeTab === "MISC" && (
        <form onSubmit={formMISC.handleSubmit(handleAdd1099MISC)} className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {editingId ? "Edit 1099-MISC" : "Add 1099-MISC (Miscellaneous Income)"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer Name *</label>
              <input
                type="text"
                {...formMISC.register("payerName")}
                placeholder="Company or person name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {formMISC.formState.errors.payerName && (
                <p className="mt-1 text-sm text-red-600">{formMISC.formState.errors.payerName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Payer EIN (Optional)</label>
              <input
                type="text"
                {...formMISC.register("payerEIN")}
                placeholder="XX-XXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Nonemployee Compensation (1099-NEC Box 1)</label>
              <input
                type="number"
                step="0.01"
                {...formMISC.register("nonemployeeCompensation", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Rents (Box 1)</label>
              <input
                type="number"
                step="0.01"
                {...formMISC.register("rents", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Royalties (Box 2)</label>
              <input
                type="number"
                step="0.01"
                {...formMISC.register("royalties", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Other Income (Box 3)</label>
              <input
                type="number"
                step="0.01"
                {...formMISC.register("otherIncome", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Federal Tax Withheld (Box 4)</label>
              <input
                type="number"
                step="0.01"
                {...formMISC.register("federalTaxWithheld", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90">
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">About 1099 Forms</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>1099-INT:</strong> Interest income from banks, bonds, or other investments</p>
          <p><strong>1099-DIV:</strong> Dividend income from stocks and mutual funds</p>
          <p><strong>1099-B:</strong> Proceeds from stock, bond, or mutual fund sales</p>
          <p><strong>1099-MISC:</strong> Miscellaneous income including freelance work, rents, and royalties</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/w2-income")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isAdding}
            className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
