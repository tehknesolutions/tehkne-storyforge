"use client";

import { useEffect, useState } from "react";
import {
  DURABLE_WORKSPACE_VERSION,
  type DurableStoryWorkspacePayload,
  type DurableWorkspaceRecord,
  type DurableWorkspaceRef,
  type DurableWorkspaceSummary
} from "@/lib/workspace-persistence";
import { useI18n } from "./i18n";

type Props = {
  payload: DurableStoryWorkspacePayload;
  suggestedTitle: string;
  canSave: boolean;
  activeRef: DurableWorkspaceRef | null;
  onActiveRefChange: (
    next: DurableWorkspaceRef | null
  ) => void;
  onLoad: (payload: DurableStoryWorkspacePayload) => void;
};

type BackendState =
  | "CHECKING"
  | "READY"
  | "AUTH_REQUIRED"
  | "UNAVAILABLE";

type OperationState =
  | "IDLE"
  | "LOADING"
  | "SAVING"
  | "SAVED"
  | "LOADED"
  | "CONFLICT"
  | "ERROR";

export function DurableWorkspacePanel({
  payload,
  suggestedTitle,
  canSave,
  activeRef,
  onActiveRefChange,
  onLoad
}: Props) {
  const { t } = useI18n();
  const [backend, setBackend] =
    useState<BackendState>("CHECKING");
  const [operation, setOperation] =
    useState<OperationState>("IDLE");
  const [workspaces, setWorkspaces] =
    useState<DurableWorkspaceSummary[]>([]);

  async function refresh(silent = false) {
    if (!silent) setOperation("LOADING");

    try {
      const response = await fetch("/api/workspace", {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`WORKSPACE_LIST_HTTP_${response.status}`);
      }

      const data = (await response.json()) as {
        workspaces?: DurableWorkspaceSummary[];
      };

      setWorkspaces(data.workspaces ?? []);
      if (!silent) setOperation("IDLE");
    } catch {
      setOperation("ERROR");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const response = await fetch("/api/auth/status", {
          cache: "no-store"
        });
        const data = (await response.json()) as {
          backend?: string;
          authenticated?: boolean;
        };

        if (cancelled) return;

        if (data.backend !== "DURABLE") {
          setBackend("UNAVAILABLE");
          return;
        }

        if (!data.authenticated) {
          setBackend("AUTH_REQUIRED");
          return;
        }

        setBackend("READY");
        await refresh(true);
      } catch {
        if (!cancelled) {
          setBackend("UNAVAILABLE");
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(asNew: boolean) {
    if (backend !== "READY" || !canSave) return;
    setOperation("SAVING");

    const title =
      suggestedTitle.trim().slice(0, 200) ||
      t("cloud.untitled");

    const body = {
      title,
      workspaceVersion: DURABLE_WORKSPACE_VERSION,
      locale: payload.workspace.locale,
      targetMedia: payload.workspace.targetMedia,
      payload
    };

    try {
      const useExisting = activeRef && !asNew;
      const response = await fetch(
        useExisting
          ? `/api/workspace/${activeRef.id}`
          : "/api/workspace",
        {
          method: useExisting ? "PATCH" : "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(
            useExisting
              ? {
                  ...body,
                  expectedRevision: activeRef.revision
                }
              : body
          )
        }
      );

      if (response.status === 409) {
        setOperation("CONFLICT");
        await refresh(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`WORKSPACE_SAVE_HTTP_${response.status}`);
      }

      const data = (await response.json()) as {
        workspace: DurableWorkspaceRecord;
      };

      onActiveRefChange({
        id: data.workspace.id,
        revision: data.workspace.revision
      });
      setOperation("SAVED");
      await refresh(true);
    } catch {
      setOperation("ERROR");
    }
  }

  async function load(id: string) {
    if (backend !== "READY") return;
    setOperation("LOADING");

    try {
      const response = await fetch(`/api/workspace/${id}`, {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`WORKSPACE_LOAD_HTTP_${response.status}`);
      }

      const data = (await response.json()) as {
        workspace: DurableWorkspaceRecord;
      };

      onLoad(data.workspace.payload);
      onActiveRefChange({
        id: data.workspace.id,
        revision: data.workspace.revision
      });
      setOperation("LOADED");
      await refresh(true);
    } catch {
      setOperation("ERROR");
    }
  }

  return (
    <section className="cloud-workspace-panel">
      <div className="cloud-workspace-head">
        <div>
          <small>{t("cloud.eyebrow")}</small>
          <h3>{t("cloud.title")}</h3>
          <p className="muted">{t("cloud.body")}</p>
        </div>
        <span className="status candidate">
          {backend === "READY" ? "DURABLE" : backend}
        </span>
      </div>

      {backend === "CHECKING" ? (
        <p className="muted">{t("cloud.checking")}</p>
      ) : null}

      {backend === "UNAVAILABLE" ? (
        <p className="muted">{t("cloud.unavailable")}</p>
      ) : null}

      {backend === "AUTH_REQUIRED" ? (
        <div className="cloud-auth-required">
          <p>{t("cloud.authRequired")}</p>
          <a href="/login?next=/">{t("cloud.signIn")}</a>
        </div>
      ) : null}

      {backend === "READY" ? (
        <>
          <div className="cloud-actions">
            <button
              type="button"
              disabled={!canSave || operation === "SAVING"}
              onClick={() => void save(false)}
            >
              {operation === "SAVING"
                ? t("cloud.saving")
                : t("cloud.save")}
            </button>
            <button
              type="button"
              className="secondary"
              disabled={!canSave || operation === "SAVING"}
              onClick={() => void save(true)}
            >
              {t("cloud.saveAsNew")}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => void refresh()}
            >
              {t("cloud.refresh")}
            </button>
          </div>

          {operation === "SAVED" ? (
            <p className="cloud-message success">{t("cloud.saved")}</p>
          ) : null}
          {operation === "LOADED" ? (
            <p className="cloud-message success">{t("cloud.loaded")}</p>
          ) : null}
          {operation === "CONFLICT" ? (
            <p className="cloud-message warning">{t("cloud.conflict")}</p>
          ) : null}
          {operation === "ERROR" ? (
            <p className="cloud-message warning">{t("cloud.error")}</p>
          ) : null}

          <div className="cloud-workspace-list">
            <small>{t("cloud.list")}</small>
            {workspaces.length ? (
              workspaces.map((workspace) => (
                <article
                  key={workspace.id}
                  className={
                    activeRef?.id === workspace.id
                      ? "active"
                      : undefined
                  }
                >
                  <div>
                    <strong>{workspace.title}</strong>
                    <span>
                      {workspace.targetMedia} · r{workspace.revision}
                    </span>
                    <small>
                      {new Date(
                        workspace.updatedAt
                      ).toLocaleString()}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => void load(workspace.id)}
                  >
                    {t("cloud.load")}
                  </button>
                </article>
              ))
            ) : (
              <p className="muted">{t("cloud.empty")}</p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
