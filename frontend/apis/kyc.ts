import { useMutation, useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";
import { api, isNotFound } from "@/lib/api";
import { keys, queryClient } from "@/lib/query-client";
import { Kyc, KycInput, PickedFile } from "@/types/kyc";

/** The user's KYC record, or null when they haven't submitted one yet. */
export function useMyKyc() {
  return useQuery({
    queryKey: keys.kyc,
    queryFn: async () => {
      try {
        return (await api.get<Kyc>("/kyc/me")).data ?? null;
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
  });
}

async function appendFile(form: FormData, field: string, file: PickedFile) {
  const name = file.name || `${field}.jpg`;
  const type = file.mimeType || "image/jpeg";
  if (Platform.OS === "web") {
    // Browsers need a real Blob; the {uri,name,type} shape is React Native only.
    const blob = file.file ?? (await (await fetch(file.uri)).blob());
    form.append(field, blob, name);
  } else {
    form.append(field, { uri: file.uri, name, type } as unknown as Blob);
  }
}

export function useSubmitKyc() {
  return useMutation({
    mutationFn: async (input: KycInput & { front: PickedFile; back?: PickedFile | null; selfie: PickedFile }) => {
      const { front, back, selfie, ...data } = input;
      const form = new FormData();
      form.append("kyc_data", JSON.stringify(data));
      await appendFile(form, "document_front", front);
      await appendFile(form, "selfie", selfie);
      if (back) await appendFile(form, "document_back", back);
      return (await api.post<Kyc>("/kyc/", form)).data;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.kyc }),
        queryClient.invalidateQueries({ queryKey: keys.me }),
      ]),
  });
}
