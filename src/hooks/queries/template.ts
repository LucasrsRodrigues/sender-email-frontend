import { useMutation, useQuery } from "@tanstack/react-query";
import {
  advancedPreviewTemplate,
  getTemplate,
  getTemplateHistory,
  getTemplates,
  getTemplateVariables,
  previewTemplate,
  validateTemplateVariables,
} from "../../api";

// Queries
export const useTemplates = () =>
  useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

export const useTemplate = (name: string) =>
  useQuery({
    queryKey: ["template", name],
    queryFn: () => getTemplate(name),
    enabled: !!name,
  });

export const useTemplateHistory = (name: string, limit?: number) =>
  useQuery({
    queryKey: ["template-history", name, limit],
    queryFn: () => getTemplateHistory(name, limit),
    enabled: !!name,
  });

export const useTemplateVariables = (name: string) =>
  useQuery({
    queryKey: ["template-variables", name],
    queryFn: () => getTemplateVariables(name),
    enabled: !!name,
  });

// Mutations para Preview
export const useTemplatePreview = () =>
  useMutation({
    mutationFn: ({
      name,
      variables,
    }: {
      name: string;
      variables: Record<string, any>;
    }) => previewTemplate(name, variables),
  });

export const useAdvancedTemplatePreview = () =>
  useMutation({
    mutationFn: ({
      name,
      data,
    }: {
      name: string;
      data: {
        variables: Record<string, any>;
        validateVariables?: boolean;
        includeMetadata?: boolean;
        format?: "html" | "text" | "both";
      };
    }) => advancedPreviewTemplate(name, data),
  });

export const useValidateTemplateVariables = () =>
  useMutation({
    mutationFn: ({
      name,
      variables,
    }: {
      name: string;
      variables: Record<string, any>;
    }) => validateTemplateVariables(name, variables),
  });
