"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getCurrentTaxReturn,
  saveTaxReturn,
} from "@/lib/tax-prep/storage";
import { W2Income } from "@/lib/tax-prep/types";
import {
  processImage,
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
  type OCRProgress,
} from "@/lib/tax-prep/ocr";
import {
  parseW2Text,
  validateParsedW2,
  type ParsedW2Data,
} from "@/lib/tax-prep/parsers/w2-parser";

const w2Schema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  employerEIN: z
    .string()
    .regex(/^\d{2}-?\d{7}$/, "Invalid EIN format (XX-XXXXXXX)"),
  wages: z.number().min(0, "Cannot be negative"),
  federalTaxWithheld: z.number().min(0, "Cannot be negative"),
  socialSecurityWages: z.number().min(0, "Cannot be negative"),
  socialSecurityTaxWithheld: z.number().min(0, "Cannot be negative"),
  medicareWages: z.number().min(0, "Cannot be negative"),
  medicareTaxWithheld: z.number().min(0, "Cannot be negative"),
  stateTaxWithheld: z.number().min(0, "Cannot be negative").optional(),
  stateWages: z.number().min(0, "Cannot be negative").optional(),
  state: z.string().optional(),
});

type W2FormData = z.infer<typeof w2Schema>;

export default function W2IncomePage() {
  const router = useRouter();
  const [w2s, setW2s] = useState<W2Income[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // OCR Upload States
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<W2FormData>({
    resolver: zodResolver(w2Schema),
    defaultValues: {
      wages: 0,
      federalTaxWithheld: 0,
      socialSecurityWages: 0,
      socialSecurityTaxWithheld: 0,
      medicareWages: 0,
      medicareTaxWithheld: 0,
      stateTaxWithheld: 0,
      stateWages: 0,
    },
  });

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setW2s(taxReturn.form1040.w2Income || []);
  }, [router]);

  const handleAddW2 = (data: W2FormData) => {
    const newW2: W2Income = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      employerName: data.employerName,
      employerEIN: data.employerEIN,
      wages: data.wages,
      federalTaxWithheld: data.federalTaxWithheld,
      socialSecurityWages: data.socialSecurityWages,
      socialSecurityTaxWithheld: data.socialSecurityTaxWithheld,
      medicareWages: data.medicareWages,
      medicareTaxWithheld: data.medicareTaxWithheld,
      stateTaxWithheld: data.stateTaxWithheld,
      stateWages: data.stateWages,
      state: data.state,
    };

    let updatedW2s: W2Income[];
    if (editingId) {
      updatedW2s = w2s.map((w) => (w.id === editingId ? newW2 : w));
      setEditingId(null);
    } else {
      updatedW2s = [...w2s, newW2];
    }

    setW2s(updatedW2s);
    setIsAdding(false);
    reset();

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.w2Income = updatedW2s;
      saveTaxReturn(taxReturn);
    }
  };

  const handleEditW2 = (w2: W2Income) => {
    setIsAdding(true);
    setEditingId(w2.id);
    setValue("employerName", w2.employerName);
    setValue("employerEIN", w2.employerEIN);
    setValue("wages", w2.wages);
    setValue("federalTaxWithheld", w2.federalTaxWithheld);
    setValue("socialSecurityWages", w2.socialSecurityWages);
    setValue("socialSecurityTaxWithheld", w2.socialSecurityTaxWithheld);
    setValue("medicareWages", w2.medicareWages);
    setValue("medicareTaxWithheld", w2.medicareTaxWithheld);
    setValue("stateTaxWithheld", w2.stateTaxWithheld || 0);
    setValue("stateWages", w2.stateWages || 0);
    setValue("state", w2.state || "");
  };

  const handleDeleteW2 = (id: string) => {
    if (!confirm("Are you sure you want to remove this W-2?")) return;

    const updatedW2s = w2s.filter((w) => w.id !== id);
    setW2s(updatedW2s);

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.w2Income = updatedW2s;
      saveTaxReturn(taxReturn);
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (!taxReturn.progress.completedSections.includes("w2-income")) {
      taxReturn.progress.completedSections.push("w2-income");
    }
    taxReturn.progress.currentStep = 3;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/1099-income");
  };

  // OCR Upload Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadError(null);
    setOcrProgress(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    // Create preview
    const preview = createImagePreview(file);
    setPreviewUrl(preview);

    // Process OCR
    setIsProcessing(true);
    try {
      const result = await processImage(file, (progress) => {
        setOcrProgress(progress);
      });

      // Parse W-2 data
      const parsedData = parseW2Text(result.text);
      const missingFields = validateParsedW2(parsedData);

      if (missingFields.length > 0) {
        setUploadError(
          `Could not extract all fields: ${missingFields.join(", ")}. Please review and fill in missing information.`
        );
      }

      // Auto-fill form fields
      if (parsedData.employerName) setValue("employerName", parsedData.employerName);
      if (parsedData.employerEIN) setValue("employerEIN", parsedData.employerEIN);
      if (parsedData.wages !== undefined) setValue("wages", parsedData.wages);
      if (parsedData.federalTaxWithheld !== undefined)
        setValue("federalTaxWithheld", parsedData.federalTaxWithheld);
      if (parsedData.socialSecurityWages !== undefined)
        setValue("socialSecurityWages", parsedData.socialSecurityWages);
      if (parsedData.socialSecurityTaxWithheld !== undefined)
        setValue("socialSecurityTaxWithheld", parsedData.socialSecurityTaxWithheld);
      if (parsedData.medicareWages !== undefined)
        setValue("medicareWages", parsedData.medicareWages);
      if (parsedData.medicareTaxWithheld !== undefined)
        setValue("medicareTaxWithheld", parsedData.medicareTaxWithheld);
      if (parsedData.stateTaxWithheld !== undefined)
        setValue("stateTaxWithheld", parsedData.stateTaxWithheld);
      if (parsedData.stateWages !== undefined) setValue("stateWages", parsedData.stateWages);
      if (parsedData.state) setValue("state", parsedData.state);
    } catch (error) {
      console.error("OCR error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to process image. Please enter manually."
      );
    } finally {
      setIsProcessing(false);
      setOcrProgress(null);
    }
  };

  const handleClearUpload = () => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }
    setPreviewUrl(null);
    setUploadError(null);
    setOcrProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalWages = w2s.reduce((sum, w2) => sum + w2.wages, 0);
  const totalFederalWithheld = w2s.reduce((sum, w2) => sum + w2.federalTaxWithheld, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">W-2 Wage Income</h1>
        <p className="mt-2 text-gray-600">
          Enter information from your W-2 forms. Your employer provides these at
          the end of the year.
        </p>
      </div>

      {/* Summary */}
      {w2s.length > 0 && !isAdding && (
        <div className="mb-8 rounded-lg bg-primary/10 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Total Wages</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalWages.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Federal Tax Withheld</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalFederalWithheld.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing W-2s List */}
      {w2s.length > 0 && !isAdding && (
        <div className="mb-8 space-y-4">
          {w2s.map((w2) => (
            <div
              key={w2.id}
              className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {w2.employerName}
                </h3>
                <p className="text-sm text-gray-500">EIN: {w2.employerEIN}</p>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="font-medium text-gray-700">Wages (Box 1)</p>
                    <p className="text-foreground">
                      ${w2.wages.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Federal Withholding (Box 2)
                    </p>
                    <p className="text-foreground">
                      ${w2.federalTaxWithheld.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Social Security Tax (Box 4)
                    </p>
                    <p className="text-foreground">
                      ${w2.socialSecurityTaxWithheld.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEditW2(w2)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteW2(w2.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add W-2 Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAddW2)} className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {editingId ? "Edit W-2" : "Add W-2 Form"}
            </h2>

            {/* Upload W-2 Image */}
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border-2 border-dashed border-blue-300">
              <div className="flex items-start gap-3">
                <svg
                  className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Upload W-2 Image (Optional)
                    <span className="ml-2 text-xs font-normal bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                      Save 5+ minutes
                    </span>
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Take a photo or upload an image of your W-2, and we'll automatically fill in the fields for you. All processing happens in your browser - your data never leaves your device.
                  </p>

                  {!previewUrl && !isProcessing && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="w2-upload"
                      />
                      <label
                        htmlFor="w2-upload"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Choose File
                      </label>
                      <p className="mt-2 text-xs text-blue-700">
                        <strong>Tip:</strong> For best results, ensure the W-2 is flat and well-lit. Accepts JPG, PNG, WebP, or PDF (max 10MB).
                      </p>
                    </div>
                  )}

                  {isProcessing && ocrProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm font-medium text-blue-900">
                          {ocrProgress.status}... {Math.round(ocrProgress.progress * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${ocrProgress.progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {previewUrl && !isProcessing && (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="W-2 Preview"
                          className="h-32 rounded-lg border border-blue-300"
                        />
                        <button
                          type="button"
                          onClick={handleClearUpload}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Image processed successfully!
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Please review the auto-filled fields below and make any necessary corrections.
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                      <p className="text-sm text-yellow-800">{uploadError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Employer Info */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Employer Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employer Name *
                    </label>
                    <input
                      type="text"
                      {...register("employerName")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.employerName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.employerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employer ID Number (EIN) *
                    </label>
                    <input
                      type="text"
                      placeholder="XX-XXXXXXX"
                      {...register("employerEIN")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.employerEIN && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.employerEIN.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Federal Boxes */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Federal Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 1 - Wages, Tips, Other Compensation *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("wages", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.wages && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.wages.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 2 - Federal Income Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("federalTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.federalTaxWithheld && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.federalTaxWithheld.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Security & Medicare */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Social Security & Medicare
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 3 - Social Security Wages *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("socialSecurityWages", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 4 - Social Security Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("socialSecurityTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 5 - Medicare Wages *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("medicareWages", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 6 - Medicare Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("medicareTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
              >
                {editingId ? "Update W-2" : "Add W-2"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 font-semibold text-gray-700 hover:border-primary hover:text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add a W-2
          </button>
        </div>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          Where to find this information
        </h3>
        <p className="text-sm text-blue-800">
          Your W-2 form is provided by your employer, usually by January 31st. All
          the boxes are clearly labeled on the form. The most important boxes are:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• <strong>Box 1:</strong> Total wages you earned</li>
          <li>• <strong>Box 2:</strong> Federal income tax withheld</li>
          <li>• <strong>Boxes 3-6:</strong> Social Security and Medicare taxes</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/dependents")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {w2s.length === 0 && (
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Skip (No W-2 Income)
            </button>
          )}
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
