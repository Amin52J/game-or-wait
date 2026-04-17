"use client";

import React from "react";
import { Modal } from "@/shared/ui";
import { SubHeading, P, OL, Callout } from "./HelpPage.styles";

export function ApiKeyInfoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="API keys explained">
      <P>
        GameOrWait doesn&apos;t have its own AI — instead, it connects to an AI provider of your
        choice (Anthropic, OpenAI, Google, or a custom endpoint). To do this, you need an{" "}
        <strong>API key</strong>.
      </P>

      <SubHeading>What is an API key?</SubHeading>
      <P>
        An API key is like a password that lets GameOrWait talk to the AI service on your behalf. You
        get it from the AI provider&apos;s website and paste it into GameOrWait during setup. Each
        analysis uses a tiny amount of the provider&apos;s credit (usually fractions of a cent).
      </P>

      <SubHeading>How to get one</SubHeading>
      <OL>
        <li>
          <strong>Anthropic (Claude):</strong> Go to <code>console.anthropic.com</code>, create an
          account, navigate to API Keys, and create a new key. You&apos;ll get some free credits
          to start.
        </li>
        <li>
          <strong>OpenAI (GPT):</strong> Go to <code>platform.openai.com</code>, sign up, go to
          API Keys in your dashboard, and create a new secret key.
        </li>
        <li>
          <strong>Google (Gemini):</strong> Go to <code>aistudio.google.com</code>, sign in with
          your Google account, and create an API key from the API keys section.
        </li>
      </OL>

      <Callout $variant="info">
        <strong>Your key stays private.</strong> GameOrWait stores your API key only in your browser
        — it is never sent to GameOrWait&apos;s servers. Requests go directly from your browser to
        the AI provider. You are billed by the provider, not by GameOrWait.
      </Callout>

      <SubHeading>How much does it cost?</SubHeading>
      <P>
        A single game analysis typically costs between $0.01 and $0.05 depending on the model.
        Most providers offer free starter credits. A &quot;More Details&quot; expansion adds
        roughly the same cost again.
      </P>
    </Modal>
  );
}
