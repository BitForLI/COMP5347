import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, unwrap } from "../api/api";

const schema = z.object({
  prompt: z.string().min(1).max(500),
  options0: z.string().min(1).max(200),
  options1: z.string().min(1).max(200),
  options2: z.string().min(1).max(200),
  options3: z.string().min(1).max(200),
  correctIndex: z.coerce.number().int().min(0).max(3),
  active: z.boolean().optional(),
  category: z.string().max(50).optional(),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  explanation: z.string().max(800).optional(),
  timeLimitSec: z.coerce.number().int().min(5).max(120).optional().or(z.nan()),
});

const PAGE_SIZE = 20;

export default function Admin() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [err, setErr] = useState(null);
  const [bulk, setBulk] = useState("");
  const [bulkMsg, setBulkMsg] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { correctIndex: 0, active: true } });

  async function refresh() {
    const data = await api
      .get("/admin/questions", { params: { page, pageSize: PAGE_SIZE, q, active: activeFilter } })
      .then(unwrap);
    setList(data.questions || []);
    setTotal(data.total || 0);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, activeFilter]);

  const mapped = useMemo(() => list, [list]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function onSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  function onActiveFilterChange(e) {
    setPage(1);
    setActiveFilter(e.target.value);
  }

  async function onCreate(values) {
    setErr(null);
    const payload = {
      prompt: values.prompt,
      options: [values.options0, values.options1, values.options2, values.options3],
      correctIndex: values.correctIndex,
      active: values.active ?? true,
      category: values.category || undefined,
      imageUrl: values.imageUrl || undefined,
      explanation: values.explanation || undefined,
      timeLimitSec: Number.isFinite(values.timeLimitSec) ? values.timeLimitSec : undefined,
    };
    await api.post("/admin/questions", payload).then(unwrap);
    reset();
    await refresh();
  }

  async function onToggle(id) {
    setErr(null);
    await api.post(`/admin/questions/${id}/toggle`).then(unwrap);
    await refresh();
  }

  async function onDelete(id) {
    setErr(null);
    await api.delete(`/admin/questions/${id}`).then(unwrap);
    await refresh();
  }

  async function onBulkImport() {
    setBulkMsg(null);
    setErr(null);
    try {
      const data = await api.post("/admin/bulk-import", { json: bulk }).then(unwrap);
      setBulkMsg(`Imported: ${data.createdCount}`);
      setBulk("");
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>Admin</h2>
        {err && <div className="error">{err}</div>}
      </div>

      <div className="card">
        <h3>Create question</h3>
        <form className="form" onSubmit={handleSubmit(onCreate)}>
          <label>
            Prompt
            <textarea rows={3} {...register("prompt")} />
            {errors.prompt && <div className="error">{errors.prompt.message}</div>}
          </label>
          <div className="grid2">
            <label>
              Option 0
              <input {...register("options0")} />
              {errors.options0 && <div className="error">{errors.options0.message}</div>}
            </label>
            <label>
              Option 1
              <input {...register("options1")} />
              {errors.options1 && <div className="error">{errors.options1.message}</div>}
            </label>
            <label>
              Option 2
              <input {...register("options2")} />
              {errors.options2 && <div className="error">{errors.options2.message}</div>}
            </label>
            <label>
              Option 3
              <input {...register("options3")} />
              {errors.options3 && <div className="error">{errors.options3.message}</div>}
            </label>
          </div>
          <div className="grid2">
            <label>
              Correct index (0-3)
              <input type="number" {...register("correctIndex")} />
              {errors.correctIndex && <div className="error">{errors.correctIndex.message}</div>}
            </label>
            <label className="row">
              <input type="checkbox" defaultChecked {...register("active")} /> Active
            </label>
          </div>

          <div className="grid2">
            <label>
              Category (optional)
              <input {...register("category")} />
            </label>
            <label>
              Image URL (optional)
              <input {...register("imageUrl")} />
              {errors.imageUrl && <div className="error">{errors.imageUrl.message}</div>}
            </label>
            <label>
              Explanation (optional)
              <input {...register("explanation")} />
            </label>
            <label>
              Time limit sec (optional)
              <input type="number" {...register("timeLimitSec")} />
              {errors.timeLimitSec && <div className="error">{errors.timeLimitSec.message}</div>}
            </label>
          </div>

          <button className="btn primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "..." : "Create"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Bulk import (JSON array)</h3>
        <textarea rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder='[{"prompt":"...","options":["a","b","c","d"],"correctIndex":0,"active":true}]' />
        <div className="row">
          <button className="btn" type="button" onClick={onBulkImport} disabled={!bulk.trim()}>
            Import
          </button>
          {bulkMsg && <div className="ok">{bulkMsg}</div>}
        </div>
      </div>

      <div className="card">
        <h3>Questions</h3>
        <div className="row" style={{ gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <form onSubmit={onSearchSubmit} className="row" style={{ gap: "4px" }}>
            <input
              type="search"
              placeholder="Search prompt..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ minWidth: "200px" }}
            />
            <button className="btn" type="submit">Search</button>
            {q && (
              <button
                className="btn"
                type="button"
                onClick={() => { setSearchInput(""); setQ(""); setPage(1); }}
              >
                Clear
              </button>
            )}
          </form>
          <label className="row" style={{ gap: "4px" }}>
            Status:
            <select value={activeFilter} onChange={onActiveFilterChange}>
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <span className="muted small" style={{ marginLeft: "auto" }}>
            {total} total
          </span>
        </div>
        <div className="list">
          {mapped.length === 0 && <div className="muted">No questions match.</div>}
          {mapped.map((item) => (
            <div key={item._id} className="item">
              <div className="row space">
                <b className="truncate">{item.prompt}</b>
                <span className={`pill ${item.active ? "on" : "off"}`}>{item.active ? "active" : "inactive"}</span>
              </div>
              <div className="muted small">correctIndex: {item.correctIndex}</div>
              <div className="row">
                <button className="btn" type="button" onClick={() => onToggle(item._id)}>
                  Toggle
                </button>
                <button className="btn danger" type="button" onClick={() => onDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: "8px", marginTop: "12px", alignItems: "center" }}>
          <button
            className="btn"
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="muted small">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn"
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

