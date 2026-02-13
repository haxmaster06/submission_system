"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import {
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  ArrowRight,
  Zap,
  Filter,
  GripVertical,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

// ─── Types ───

interface FlowStep {
  id: number;
  flow_id: number;
  role_name: string;
  step_order: number;
  is_optional: boolean;
}

interface ConditionRule {
  field: string;
  operator: string;
  value: string | number;
}

interface Condition {
  id: number;
  flow_id: number;
  name: string;
  role_name: string;
  insert_after_step: number;
  condition_type: 'any_of' | 'all_of';
  condition_rules: ConditionRule[];
  is_active: boolean;
  priority: number;
}

interface Flow {
  id: number;
  name: string;
  is_default: boolean;
  is_active: boolean;
  steps: FlowStep[];
  conditions: Condition[];
}

interface FieldOption {
  field: string;
  label: string;
  type: string;
  options_key?: string;
}

interface LookupData {
  divisions: { code: string; name: string }[];
  travel_types: { id: number; name: string }[];
  roles: { id: number; name: string }[];
  available_fields: FieldOption[];
  operators: { value: string; label: string }[];
  condition_types: { value: string; label: string }[];
}

// ─── Draggable Step Card (drag via handle only) ───

function DraggableStepCard({
  step,
  onEdit,
  onDelete,
}: {
  step: FlowStep;
  onEdit: (step: FlowStep) => void;
  onDelete: (step: FlowStep) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      className="group relative bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl px-5 py-3 hover:border-sky-400 hover:shadow-md transition-all select-none"
    >
      <div className="flex items-center gap-3">
        <div
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing touch-none p-0.5"
        >
          <GripVertical className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" size={16} />
        </div>
        <span className="w-7 h-7 bg-sky-500 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-sm">
          {step.step_order}
        </span>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">{step.role_name}</p>
          {step.is_optional && (
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Opsional</span>
          )}
        </div>
      </div>
      <div className="absolute -top-2 -right-2 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-sky-600"
        >
          <Edit2 size={10} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(step)}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600"
        >
          <X size={10} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ─── Main Page ───

export default function ApprovalFlowPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [lookups, setLookups] = useState<LookupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Step editing
  const [stepDrawerOpen, setStepDrawerOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [stepForm, setStepForm] = useState({ role_name: '', is_optional: false });

  // Condition editing
  const [condDrawerOpen, setCondDrawerOpen] = useState(false);
  const [editingCond, setEditingCond] = useState<Condition | null>(null);
  const [condForm, setCondForm] = useState<{
    name: string;
    role_name: string;
    insert_after_step: number;
    condition_type: 'any_of' | 'all_of';
    condition_rules: ConditionRule[];
  }>({
    name: '',
    role_name: '',
    insert_after_step: 0,
    condition_type: 'any_of',
    condition_rules: [{ field: '', operator: '==', value: '' }],
  });

  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'step' | 'condition';
    id: number;
    label: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/approval-flows');
      setFlows(res.data.flows);
      setLookups(res.data.lookups);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeFlow = flows[0]; // Currently single flow

  // ─── Step Handlers ───

  const handleCreateStep = () => {
    setEditingStep(null);
    setStepForm({ role_name: '', is_optional: false });
    setStepDrawerOpen(true);
  };

  const handleEditStep = (step: FlowStep) => {
    setEditingStep(step);
    setStepForm({ role_name: step.role_name, is_optional: step.is_optional });
    setStepDrawerOpen(true);
  };

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlow) return;
    setSaving(true);
    try {
      if (editingStep) {
        await api.put(`/approval-flows/${activeFlow.id}/steps/${editingStep.id}`, stepForm);
      } else {
        await api.post(`/approval-flows/${activeFlow.id}/steps`, stepForm);
      }
      setStepDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan step');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = (step: FlowStep) => {
    setDeleteConfirm({ type: 'step', id: step.id, label: step.role_name });
  };

  const handleReorderSteps = async (newOrder: FlowStep[]) => {
    if (!activeFlow) return;
    // Optimistic UI update
    setFlows(prev => prev.map(f =>
      f.id === activeFlow.id ? { ...f, steps: newOrder.map((s, i) => ({ ...s, step_order: i + 1 })) } : f
    ));
    try {
      await api.post(`/approval-flows/${activeFlow.id}/steps/reorder`, {
        ids: newOrder.map(s => s.id),
      });
    } catch (err) {
      console.error('Failed to reorder steps:', err);
      fetchData(); // Rollback on error
    }
  };

  // ─── Condition Handlers ───

  const handleCreateCond = () => {
    setEditingCond(null);
    setCondForm({
      name: '',
      role_name: '',
      insert_after_step: 1,
      condition_type: 'any_of',
      condition_rules: [{ field: '', operator: '==', value: '' }],
    });
    setCondDrawerOpen(true);
  };

  const handleEditCond = (cond: Condition) => {
    setEditingCond(cond);
    setCondForm({
      name: cond.name,
      role_name: cond.role_name,
      insert_after_step: cond.insert_after_step,
      condition_type: cond.condition_type,
      condition_rules: cond.condition_rules.length > 0
        ? cond.condition_rules
        : [{ field: '', operator: '==', value: '' }],
    });
    setCondDrawerOpen(true);
  };

  const handleSaveCond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlow) return;
    setSaving(true);
    try {
      const payload = {
        ...condForm,
        condition_rules: condForm.condition_rules.filter(r => r.field && r.value !== ''),
      };
      if (editingCond) {
        await api.put(`/approval-flows/${activeFlow.id}/conditions/${editingCond.id}`, payload);
      } else {
        await api.post(`/approval-flows/${activeFlow.id}/conditions`, payload);
      }
      setCondDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan kondisi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCond = (cond: Condition) => {
    setDeleteConfirm({ type: 'condition', id: cond.id, label: cond.name });
  };

  const executeDelete = async () => {
    if (!activeFlow || !deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'step') {
        await api.delete(`/approval-flows/${activeFlow.id}/steps/${deleteConfirm.id}`);
      } else {
        await api.delete(`/approval-flows/${activeFlow.id}/conditions/${deleteConfirm.id}`);
      }
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus');
      setDeleteConfirm(null);
    }
  };

  const handleToggleCond = async (cond: Condition) => {
    if (!activeFlow) return;
    try {
      await api.patch(`/approval-flows/${activeFlow.id}/conditions/${cond.id}/toggle`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  // ─── Condition Rule Form Helpers ───

  const addRule = () => {
    setCondForm(prev => ({
      ...prev,
      condition_rules: [...prev.condition_rules, { field: '', operator: '==', value: '' }],
    }));
  };

  const removeRule = (index: number) => {
    setCondForm(prev => ({
      ...prev,
      condition_rules: prev.condition_rules.filter((_, i) => i !== index),
    }));
  };

  const updateRule = (index: number, key: keyof ConditionRule, value: string) => {
    setCondForm(prev => ({
      ...prev,
      condition_rules: prev.condition_rules.map((r, i) =>
        i === index ? { ...r, [key]: value } : r
      ),
    }));
  };

  const getFieldLabel = (field: string) => {
    return lookups?.available_fields.find(f => f.field === field)?.label || field;
  };

  const getOperatorLabel = (op: string) => {
    return lookups?.operators.find(o => o.value === op)?.label || op;
  };

  const getValueOptions = (fieldName: string) => {
    const field = lookups?.available_fields.find(f => f.field === fieldName);
    if (!field || !field.options_key || !lookups) return null;

    if (field.options_key === 'divisions') {
      return lookups.divisions.map(d => ({ value: d.code, label: `${d.name} (${d.code})` }));
    }
    if (field.options_key === 'travel_types') {
      return lookups.travel_types.map(t => ({ value: t.name, label: t.name }));
    }
    return null;
  };

  // ─── Decision Matrix Preview ───

  const buildPreview = () => {
    if (!activeFlow) return [];
    const baseRoles = activeFlow.steps.map(s => s.role_name);
    const activeConds = activeFlow.conditions.filter(c => c.is_active);

    const scenarios = [
      { label: 'Non-HRD + Non Dinas', context: { division_code: 'OPS', travel_type: 'Non Dinas' } },
      { label: 'Non-HRD + Dinas', context: { division_code: 'OPS', travel_type: 'Dinas' } },
      { label: 'HRD + Non Dinas', context: { division_code: 'HRD', travel_type: 'Non Dinas' } },
      { label: 'HRD + Dinas', context: { division_code: 'HRD', travel_type: 'Dinas' } },
    ];

    return scenarios.map(scenario => {
      let roles = [...baseRoles];

      // Evaluate conditions (simplified client-side preview)
      for (const cond of activeConds) {
        const ruleResults = cond.condition_rules.map(rule => {
          const ctxValue = (scenario.context as any)[rule.field];
          if (ctxValue === undefined) return false;
          const left = String(ctxValue).toLowerCase();
          const right = String(rule.value).toLowerCase();
          switch (rule.operator) {
            case '==': return left === right;
            case '!=': return left !== right;
            default: return false;
          }
        });

        const matches = cond.condition_type === 'all_of'
          ? ruleResults.every(Boolean)
          : ruleResults.some(Boolean);

        if (matches) {
          // Insert role after the specified step
          const insertIdx = Math.min(cond.insert_after_step, roles.length);
          roles.splice(insertIdx, 0, cond.role_name);
        }
      }

      return { ...scenario, roles };
    });
  };

  // ─── Render ───

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-sky-500" size={32} />
          <p className="text-slate-400 font-medium text-sm">Memuat pengaturan alur persetujuan...</p>
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <AlertCircle className="text-red-400" size={32} />
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={fetchData} className="text-sky-500 text-sm hover:underline">Coba lagi</button>
        </div>
      </Shell>
    );
  }

  const preview = buildPreview();

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <GitBranch className="text-sky-500" />
              Alur Persetujuan
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola alur persetujuan dan aturan kondisi dinamis
            </p>
          </div>
        </header>

        {activeFlow && (
          <>
            {/* ── Section 1: Base Flow Steps ── */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <ArrowRight size={18} className="text-sky-500" />
                    Alur Dasar ({activeFlow.name})
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Urutan persetujuan dasar yang berlaku untuk semua pengajuan — seret untuk mengubah urutan
                  </p>
                </div>
                <button
                  onClick={handleCreateStep}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-sky-100 flex items-center gap-2"
                >
                  <Plus size={14} /> Tambah Step
                </button>
              </div>

              {/* Visual Flow — Drag & Drop */}
              <div className="p-6">
                <Reorder.Group
                  axis="x"
                  values={activeFlow.steps}
                  onReorder={handleReorderSteps}
                  className="flex items-center gap-2 flex-wrap"
                >
                  {activeFlow.steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <DraggableStepCard
                        step={step}
                        onEdit={handleEditStep}
                        onDelete={handleDeleteStep}
                      />
                      {idx < activeFlow.steps.length - 1 && (
                        <ChevronRight className="text-slate-300 shrink-0 pointer-events-none" size={20} />
                      )}
                    </React.Fragment>
                  ))}
                </Reorder.Group>
              </div>
            </section>

            {/* ── Section 2: Conditions ── */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-amber-500" />
                    Aturan Kondisi
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Step tambahan yang disisipkan jika kondisi terpenuhi
                  </p>
                </div>
                <button
                  onClick={handleCreateCond}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                >
                  <Plus size={14} /> Tambah Kondisi
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeFlow.conditions.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Belum ada aturan kondisi</p>
                  </div>
                ) : (
                  activeFlow.conditions.map(cond => (
                    <motion.div
                      key={cond.id}
                      layout
                      className={`border rounded-xl p-5 transition-all ${cond.is_active
                          ? 'border-amber-200 bg-amber-50/30'
                          : 'border-slate-200 bg-slate-50/50 opacity-60'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-800 text-sm">{cond.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cond.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-500'
                              }`}>
                              {cond.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-500">
                            <p>
                              <span className="font-semibold text-slate-600">Sisipkan:</span>{' '}
                              <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md font-bold">{cond.role_name}</span>{' '}
                              setelah step {cond.insert_after_step}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-600">Logika:</span>{' '}
                              {cond.condition_type === 'any_of' ? 'Salah satu cocok (OR)' : 'Semua harus cocok (AND)'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cond.condition_rules.map((rule, ri) => (
                                <span key={ri} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                                  <span className="font-bold text-slate-700">{getFieldLabel(rule.field)}</span>
                                  <span className="text-amber-600 font-mono">{rule.operator}</span>
                                  <span className="font-bold text-sky-600">{String(rule.value)}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleCond(cond)}
                            className={`p-2 rounded-lg transition-colors ${cond.is_active ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100'
                              }`}
                            title={cond.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {cond.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button
                            onClick={() => handleEditCond(cond)}
                            className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCond(cond)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* ── Section 3: Decision Matrix Preview ── */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Info size={18} className="text-emerald-500" />
                  Preview Alur Persetujuan
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Hasil alur berdasarkan kombinasi kondisi saat ini
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preview.map((scenario, si) => {
                    const hasExtra = scenario.roles.length > (activeFlow?.steps.length || 0);
                    return (
                      <div
                        key={si}
                        className={`rounded-xl border p-4 ${hasExtra ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-slate-50/50'
                          }`}
                      >
                        <p className="font-bold text-slate-700 text-xs mb-3 flex items-center gap-2">
                          {hasExtra && <Zap size={12} className="text-amber-500" />}
                          {scenario.label}
                          <span className="text-slate-400 font-normal">({scenario.roles.length} step)</span>
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {scenario.roles.map((role, ri) => {
                            const isInserted = !activeFlow?.steps.some(s => s.role_name === role);
                            return (
                              <React.Fragment key={ri}>
                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${isInserted
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                                  }`}>
                                  {role}
                                </span>
                                {ri < scenario.roles.length - 1 && (
                                  <ChevronRight className="text-slate-300 shrink-0" size={14} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Step Modal ── */}
        <AnimatePresence>
          {stepDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setStepDrawerOpen(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">{editingStep ? 'Edit Step' : 'Tambah Step'}</h3>
                  <button onClick={() => setStepDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveStep} className="p-6 flex flex-col gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pilih Role</label>
                    <select
                      value={stepForm.role_name}
                      onChange={e => setStepForm(prev => ({ ...prev, role_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium bg-white text-slate-800"
                      required
                    >
                      <option value="">— Pilih Role —</option>
                      {lookups?.roles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stepForm.is_optional}
                      onChange={e => setStepForm(prev => ({ ...prev, is_optional: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Step opsional (dilewati jika approver tidak ada)</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStepDrawerOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {editingStep ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Condition Modal ── */}
        <AnimatePresence>
          {condDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCondDrawerOpen(false)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                  <h3 className="font-bold text-slate-800">{editingCond ? 'Edit Kondisi' : 'Tambah Kondisi'}</h3>
                  <button onClick={() => setCondDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveCond} className="p-6 flex flex-col gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nama Kondisi</label>
                    <input
                      type="text"
                      value={condForm.name}
                      onChange={e => setCondForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contoh: GA Legal Required"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-800 bg-white placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Role to insert */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Role yang Disisipkan</label>
                    <select
                      value={condForm.role_name}
                      onChange={e => setCondForm(prev => ({ ...prev, role_name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-800 bg-white"
                      required
                    >
                      <option value="">— Pilih Role —</option>
                      {lookups?.roles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Insert position */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Posisi Penyisipan</label>
                    <select
                      value={condForm.insert_after_step}
                      onChange={e => setCondForm(prev => ({ ...prev, insert_after_step: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium text-slate-800 bg-white"
                    >
                      <option value={0}>Di awal (sebelum semua step)</option>
                      {activeFlow?.steps.map(s => (
                        <option key={s.id} value={s.step_order}>
                          Setelah Step {s.step_order}: {s.role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Tipe Logika</label>
                    <div className="flex gap-3">
                      {lookups?.condition_types.map(ct => (
                        <label
                          key={ct.value}
                          className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${condForm.condition_type === ct.value
                              ? 'border-sky-400 bg-sky-50 text-sky-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                        >
                          <input
                            type="radio"
                            name="condition_type"
                            value={ct.value}
                            checked={condForm.condition_type === ct.value}
                            onChange={() => setCondForm(prev => ({ ...prev, condition_type: ct.value as 'any_of' | 'all_of' }))}
                            className="sr-only"
                          />
                          {ct.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rules Builder */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Aturan</label>
                      <button
                        type="button"
                        onClick={addRule}
                        className="text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1"
                      >
                        <Plus size={12} /> Tambah Aturan
                      </button>
                    </div>
                    <div className="space-y-3">
                      {condForm.condition_rules.map((rule, ri) => (
                        <div key={ri} className="flex gap-2 items-start">
                          {/* Field */}
                          <select
                            value={rule.field}
                            onChange={e => updateRule(ri, 'field', e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            <option value="">Pilih field...</option>
                            {lookups?.available_fields.map(f => (
                              <option key={f.field} value={f.field}>{f.label}</option>
                            ))}
                          </select>
                          {/* Operator */}
                          <select
                            value={rule.operator}
                            onChange={e => updateRule(ri, 'operator', e.target.value)}
                            className="w-24 px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                          >
                            {lookups?.operators.map(op => (
                              <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                          </select>
                          {/* Value */}
                          {getValueOptions(rule.field) ? (
                            <select
                              value={String(rule.value)}
                              onChange={e => updateRule(ri, 'value', e.target.value)}
                              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
                            >
                              <option value="">Pilih nilai...</option>
                              {getValueOptions(rule.field)?.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={lookups?.available_fields.find(f => f.field === rule.field)?.type === 'number' ? 'number' : 'text'}
                              value={String(rule.value)}
                              onChange={e => updateRule(ri, 'value', e.target.value)}
                              placeholder="Nilai..."
                              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400"
                            />
                          )}
                          {/* Remove */}
                          {condForm.condition_rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRule(ri)}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCondDrawerOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {editingCond ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Delete Confirmation Modal ── */}
        <AnimatePresence>
          {deleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="text-red-500" size={22} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Hapus {deleteConfirm.type === 'step' ? 'Step' : 'Kondisi'}?</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    <span className="font-semibold text-slate-700">&quot;{deleteConfirm.label}&quot;</span> akan dihapus permanen.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={executeDelete}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-lg shadow-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}
