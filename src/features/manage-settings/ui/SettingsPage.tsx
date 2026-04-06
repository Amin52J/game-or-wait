"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { useApp } from "@/app/providers/AppProvider";
import { generateInstructions } from "@/features/setup-wizard/lib/prompt-generator";
import { exportData, importData, clearData } from "@/shared/lib/storage";
import type { AIProviderConfig, AIProviderType } from "@/shared/types";
import { DEFAULT_MODELS } from "@/shared/types";

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const SectionDesc = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: border-color ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 0.82rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color ${({ theme }) => theme.transition.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Btn = styled.button<{ $variant?: "primary" | "secondary" | "danger" | "ghost" }>`
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "primary"
        ? theme.colors.accent
        : $variant === "danger"
          ? theme.colors.error
          : $variant === "ghost"
            ? "transparent"
            : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.accent
      : $variant === "danger"
        ? theme.colors.errorMuted
        : $variant === "ghost"
          ? "transparent"
          : theme.colors.surface};
  color: ${({ theme, $variant }) =>
    $variant === "primary"
      ? "#fff"
      : $variant === "danger"
        ? theme.colors.error
        : theme.colors.text};

  &:hover {
    opacity: 0.85;
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const Toast = styled.div<{ $type: "success" | "error" }>`
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme, $type }) =>
    $type === "success" ? theme.colors.successMuted : theme.colors.errorMuted};
  color: ${({ theme, $type }) => ($type === "success" ? theme.colors.success : theme.colors.error)};
  font-size: 0.85rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export function SettingsPage() {
  const { state, setAIProvider, setInstructions, resetApp } = useApp();

  const [providerType, setProviderType] = useState<AIProviderType>(
    state.aiProvider?.type || "anthropic",
  );
  const [apiKey, setApiKey] = useState(state.aiProvider?.apiKey || "");
  const [model, setModel] = useState(state.aiProvider?.model || "");
  const [baseUrl, setBaseUrl] = useState(state.aiProvider?.baseUrl || "");
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [editableInstructions, setEditableInstructions] = useState(state.instructions);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProvider = () => {
    const config: AIProviderConfig = {
      type: providerType,
      apiKey,
      model: model || DEFAULT_MODELS[providerType]?.[0] || "",
      ...(providerType === "custom" ? { baseUrl } : {}),
    };
    setAIProvider(config);
    showToast("AI provider saved");
  };

  const saveInstructions = () => {
    setInstructions(editableInstructions);
    setIsEditingInstructions(false);
    showToast("Instructions saved");
  };

  const regenerateInstructions = () => {
    if (!state.setupAnswers) {
      showToast("No setup answers found — re-run setup to regenerate", "error");
      return;
    }
    const newInst = generateInstructions(state.setupAnswers);
    setEditableInstructions(newInst);
    setInstructions(newInst);
    showToast("Instructions regenerated from your preferences");
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gamefit-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          importData(reader.result as string);
          showToast("Data imported — reload the page to see changes");
          setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
          showToast("Invalid backup file", "error");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm("This will delete ALL your data (library, settings, history). Are you sure?")) {
      clearData();
      resetApp();
      window.location.reload();
    }
  };

  return (
    <Page>
      <Title>Settings</Title>

      {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

      <Section>
        <SectionTitle>AI Provider</SectionTitle>
        <SectionDesc>Configure which AI model to use for game analysis.</SectionDesc>

        <FormRow>
          <FormGroup>
            <Label>Provider</Label>
            <StyledSelect
              value={providerType}
              onChange={(e) => {
                const t = e.target.value as AIProviderType;
                setProviderType(t);
                setModel(DEFAULT_MODELS[t]?.[0] || "");
              }}
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="custom">Custom Endpoint</option>
            </StyledSelect>
          </FormGroup>
          <FormGroup>
            <Label>Model</Label>
            {DEFAULT_MODELS[providerType]?.length > 0 ? (
              <StyledSelect value={model} onChange={(e) => setModel(e.target.value)}>
                {DEFAULT_MODELS[providerType].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </StyledSelect>
            ) : (
              <StyledInput
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model name"
              />
            )}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>API Key</Label>
            <div style={{ position: "relative" }}>
              <StyledInput
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </FormGroup>
          {providerType === "custom" && (
            <FormGroup>
              <Label>Base URL</Label>
              <StyledInput
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </FormGroup>
          )}
        </FormRow>

        <BtnRow>
          <Btn $variant="primary" onClick={saveProvider}>
            Save Provider
          </Btn>
        </BtnRow>
      </Section>

      <Section>
        <SectionTitle>Analysis Instructions</SectionTitle>
        <SectionDesc>
          These instructions are sent to the AI along with your game library when analyzing a game.
          They define how the AI evaluates games for you.
        </SectionDesc>

        <TextArea
          value={editableInstructions}
          onChange={(e) => setEditableInstructions(e.target.value)}
          readOnly={!isEditingInstructions}
          style={{ opacity: isEditingInstructions ? 1 : 0.75 }}
        />

        <BtnRow>
          {isEditingInstructions ? (
            <>
              <Btn $variant="primary" onClick={saveInstructions}>
                Save Instructions
              </Btn>
              <Btn
                $variant="secondary"
                onClick={() => {
                  setEditableInstructions(state.instructions);
                  setIsEditingInstructions(false);
                }}
              >
                Cancel
              </Btn>
            </>
          ) : (
            <>
              <Btn $variant="secondary" onClick={() => setIsEditingInstructions(true)}>
                Edit Instructions
              </Btn>
              <Btn $variant="secondary" onClick={regenerateInstructions}>
                Regenerate from Preferences
              </Btn>
            </>
          )}
        </BtnRow>
      </Section>

      <Section>
        <SectionTitle>Data Management</SectionTitle>
        <SectionDesc>Export, import, or reset your GameFit data.</SectionDesc>

        <BtnRow>
          <Btn $variant="secondary" onClick={handleExport}>
            Export Backup
          </Btn>
          <Btn $variant="secondary" onClick={handleImport}>
            Import Backup
          </Btn>
        </BtnRow>

        <Divider />

        <SectionTitle style={{ color: "#ef4444" }}>Danger Zone</SectionTitle>
        <SectionDesc>Permanently delete all data and start over.</SectionDesc>
        <BtnRow>
          <Btn $variant="danger" onClick={handleReset}>
            Reset Everything
          </Btn>
        </BtnRow>
      </Section>
    </Page>
  );
}
