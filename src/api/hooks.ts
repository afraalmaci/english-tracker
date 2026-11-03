import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "../components/Toast";
import type { TableName, Tables } from "../lib/types";

/** Primary key columns per table (user_id is implicit in composite keys). */
const PK: { [K in TableName]: (keyof Tables[K] & string)[] } = {
  day_logs: ["day"],
  weekly_notes: ["week_start"],
  phrases: ["id"],
  vocab: ["id"],
  grammar_topics: ["id"],
  writing_logs: ["id"],
  level_tests: ["id"],
  resources: ["id"],
};

const ORDER: Record<TableName, { column: string; ascending: boolean }> = {
  day_logs: { column: "day", ascending: false },
  weekly_notes: { column: "week_start", ascending: false },
  phrases: { column: "created_at", ascending: false },
  vocab: { column: "created_at", ascending: false },
  grammar_topics: { column: "created_at", ascending: true },
  writing_logs: { column: "day", ascending: false },
  level_tests: { column: "day", ascending: true },
  resources: { column: "updated_at", ascending: false },
};

const onConflict = (table: TableName) => {
  const keys = PK[table] as string[];
  return keys[0] === "id" ? "id" : ["user_id", ...keys].join(",");
};

const sameRow = <K extends TableName>(table: K, a: Tables[K], b: Tables[K]) =>
  PK[table].every((k) => a[k] === b[k]);

/** All rows of a table for the signed-in user (RLS does the filtering). */
export function useRows<K extends TableName>(table: K) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [table, user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Tables[K][]> => {
      const { column, ascending } = ORDER[table];
      const { data, error } = await supabase.from(table).select("*").order(column, { ascending });
      if (error) throw error;
      return (data ?? []) as Tables[K][];
    },
  });
}

/** Insert or update a row with an optimistic cache update, rolled back on error. */
export function useSave<K extends TableName>(table: K) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const key = [table, user?.id];
  return useMutation({
    mutationFn: async (row: Tables[K]) => {
      const { error } = await supabase.from(table).upsert({ ...row, user_id: user!.id }, { onConflict: onConflict(table) });
      if (error) throw error;
    },
    onMutate: async (row: Tables[K]) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Tables[K][]>(key);
      qc.setQueryData<Tables[K][]>(key, (old = []) => {
        const i = old.findIndex((r) => sameRow(table, r, row));
        if (i === -1) return [row, ...old];
        const next = old.slice();
        next[i] = row;
        return next;
      });
      return { prev };
    },
    onError: (err, _row, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast(`Kaydedilemedi: ${err instanceof Error ? err.message : "hata"}`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

/** Delete a row by id with an optimistic cache update. */
export function useRemove<K extends Exclude<TableName, "day_logs" | "weekly_notes">>(table: K) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const key = [table, user?.id];
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Tables[K][]>(key);
      qc.setQueryData<Tables[K][]>(key, (old = []) => old.filter((r) => (r as { id: string }).id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast(`Silinemedi: ${err instanceof Error ? err.message : "hata"}`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

/** Fetch every table at once, for the JSON backup. */
export async function exportAll() {
  const tables = Object.keys(PK) as TableName[];
  const out: Record<string, unknown[]> = {};
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*");
    if (error) throw error;
    out[t] = data ?? [];
  }
  return out;
}
