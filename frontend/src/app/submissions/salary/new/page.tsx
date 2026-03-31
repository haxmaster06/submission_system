"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Save, Send, Loader2, Info, Users, CalendarDays, Check, FileText, Trash2, Zap, Copy, UploadCloud, File, X, Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function NewSalarySubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const editId = searchParams.get('edit');
  const duplicateId = searchParams.get('duplicate');
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectionMode, setSelectionMode] = useState<'all' | 'manual'>('all');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [matrixData, setMatrixData] = useState<Record<number, Record<string, number | ''>>>({});

  const [lookups, setLookups] = useState<any>({
    divisions: [],
    jenis_pengajuan: [],
    jenis_perjalanan: [],
    uoms: [],
    urgency_statuses: []
  });

  const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'Super Admin');
  const canSubmitSalary = user?.permissions?.some((p: any) => p.name === 'manage employees') || isSuperAdmin;

  const [form, setForm] = useState({
    division_id: '',
    jenis_pengajuan_id: '',
    jenis_perjalanan_id: '',
    status_urgent: 'Normal',
    description: '',
    notes: '',
    final_status: '',
    tanggal_pengajuan: new Date().toISOString().split('T')[0],
  });
  
  const [duplicateResData, setDuplicateResData] = useState<any>(null);

  useEffect(() => {
     if (user && !canSubmitSalary) {
         router.push('/submissions');
     }
  }, [user, canSubmitSalary, router]);

  useEffect(() => {
    Promise.all([
      api.get('/lookups'),
      api.get('/master/employees?per_page=500').catch(() => ({ data: { data: [] } })),
      (editId || duplicateId) ? api.get(`/submissions/${editId || duplicateId}`) : Promise.resolve({ data: null })
    ]).then(([lookupsRes, empRes, duplicateRes]) => {
      setLookups(lookupsRes.data);
      
      // Handle both array and paginated response
      const empData = Array.isArray(empRes.data) ? empRes.data : (empRes.data?.data || []);
      
      if (empData.length > 0) {
        setEmployees(empData.filter((e: any) => e.is_active));
      }
      
      const salaryType = lookupsRes.data.jenis_pengajuan?.find((j: any) => j.name?.toLowerCase().includes('gaji karyawan harian'));
      const d = duplicateRes.data ? (duplicateRes.data.data || duplicateRes.data) : null;
      
      if (d) {
        setDuplicateResData(d);
        setForm({
          division_id: String(d.division_id || ''),
          jenis_pengajuan_id: String(d.jenis_pengajuan_id || (salaryType ? salaryType.id : '')),
          jenis_perjalanan_id: String(d.jenis_perjalanan_id || ''),
          status_urgent: d.status_urgent || 'Normal',
          description: d.description || '',
          notes: d.notes || '',
          final_status: d.final_status || '',
          tanggal_pengajuan: d.tanggal_pengajuan || new Date().toISOString().split('T')[0],
        });

        if (d.payload) {
           if (d.payload.date_range) {
               setDateRange(d.payload.date_range);
           }
           if (d.payload.employees && d.payload.employees.length > 0) {
               const newMatrix: Record<number, Record<string, number | ''>> = {};
               d.payload.employees.forEach((emp: any) => {
                   newMatrix[emp.employee_id] = {};
                   emp.daily_records?.forEach((rec: any) => {
                       if (rec.is_present && rec.nominal > 0) {
                          newMatrix[emp.employee_id][rec.date] = rec.nominal;
                       }
                   });
               });
               setMatrixData(newMatrix);
           }
        }
      } else {
        if(salaryType) {
            setForm(prev => ({ ...prev, jenis_pengajuan_id: String(salaryType.id) }));
        }
      }
      
      setLoading(false);
       if (d && d.payload?.selected_employee_ids) {
          setSelectionMode('manual');
          setSelectedEmployeeIds(new Set(d.payload.selected_employee_ids));
       }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [duplicateId, editId]);

  useEffect(() => {
    if (user && !isSuperAdmin && user.division?.id) {
      setForm(prev => ({ ...prev, division_id: String(user.division?.id) }));
    }
  }, [user, isSuperAdmin]);

  const datesArray = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return [];
    let start = new Date(dateRange.start);
    let end = new Date(dateRange.end);
    let arr = [];
    if (end < start) return [];

    let daysDiff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 31) {
      end = new Date(start);
      end.setDate(end.getDate() + 31);
    }

    for(let dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt).toISOString().split('T')[0]);
    }
    return arr;
  }, [dateRange]);

  useEffect(() => {
      setExcludedDates([]);
  }, [dateRange.start, dateRange.end]);

  const activeDatesArray = useMemo(() => {
      return datesArray.filter(d => !excludedDates.includes(d));
  }, [datesArray, excludedDates]);

  const filteredEmployees = useMemo(() => {
      if (selectionMode === 'all') return employees;
      return employees.filter(emp => selectedEmployeeIds.has(emp.id));
  }, [employees, selectionMode, selectedEmployeeIds]);

  const selectableEmployees = useMemo(() => {
      if (!employeeSearch.trim()) return employees;
      const q = employeeSearch.toLowerCase();
      return employees.filter(emp => 
          emp.name.toLowerCase().includes(q) || 
          emp.department.toLowerCase().includes(q)
      );
  }, [employees, employeeSearch]);

  const toggleEmployeeSelection = (id: number) => {
      setSelectedEmployeeIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const toggleExcludeDate = (date: string) => {
      setExcludedDates(prev => {
          if (prev.includes(date)) {
              return prev.filter(d => d !== date);
          } else {
              setMatrixData(matrix => {
                  const newMatrix = { ...matrix };
                  Object.keys(newMatrix).forEach(empIdStr => {
                      const empId = Number(empIdStr);
                      if (newMatrix[empId] && newMatrix[empId][date] !== undefined) {
                          delete newMatrix[empId][date];
                      }
                  });
                  return newMatrix;
              });
              return [...prev, date];
          }
      });
  };

  const handleMatrixChange = (empId: number, dateStr: string, value: string) => {
    setMatrixData(prev => {
      const empData = prev[empId] || {};
      const numValue = value === '' ? '' : Math.max(0, Number(value));
      return {
        ...prev,
        [empId]: {
          ...empData,
          [dateStr]: numValue
        }
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const selectedFiles = Array.from(e.target.files as FileList);
        const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
        if (validFiles.length !== selectedFiles.length) {
            alert('Beberapa file melebihi batas 10MB dan tidak ditambahkan.');
        }
        setFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fillAllMatrix = () => {
    setMatrixData(prev => {
      const newMatrix = { ...prev };
      filteredEmployees.forEach(emp => {
        if (!newMatrix[emp.id]) newMatrix[emp.id] = {};
        const dailyRate = Math.round((parseFloat(emp.base_salary) || 0) / 25);
        activeDatesArray.forEach(date => {
          newMatrix[emp.id][date] = dailyRate;
        });
      });
      return newMatrix;
    });
  };

  const clearAllMatrix = () => {
    if (confirm('Yakin ingin mengosongkan seluruh grid matrix gaji?')) {
        setMatrixData({});
    }
  };

  const fillRow = (empId: number) => {
    setMatrixData(prev => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) return prev;
      const dailyRate = Math.round((parseFloat(emp.base_salary) || 0) / 25);
      const rowUpdates: Record<string, number | ''> = { ...(prev[empId] || {}) };
      activeDatesArray.forEach(d => rowUpdates[d] = dailyRate);
      return { ...prev, [empId]: rowUpdates };
    });
  };

  const clearRow = (empId: number) => {
    setMatrixData(prev => {
      const newMatrix = { ...prev };
      delete newMatrix[empId];
      return newMatrix;
    });
    if (selectionMode === 'manual') {
      setSelectedEmployeeIds(prev => {
        const next = new Set(prev);
        next.delete(empId);
        return next;
      });
    }
  };

   const matrixGrandTotal = useMemo(() => {
    let total = 0;
    Object.keys(matrixData).forEach(empIdStr => {
      const empId = Number(empIdStr);
      // Only count if employee is in current filtered list
      if (selectionMode === 'manual' && !selectedEmployeeIds.has(empId)) return;
      
      const dates = matrixData[empId];
      Object.entries(dates).forEach(([dateStr, val]) => {
        if (activeDatesArray.includes(dateStr) && typeof val === 'number') total += val;
      });
    });
    return total;
  }, [matrixData, activeDatesArray, selectionMode, selectedEmployeeIds]);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (datesArray.length === 0) {
      alert('Pilih rentang tanggal (Start Date & End Date) terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      let payload: any = { ...form };
      delete payload.final_status;
      payload.is_draft = isDraft;
      
      const salaryItems = filteredEmployees.map(emp => {
          const daysData = matrixData[emp.id] || {};
          const dailyFlags = activeDatesArray.map(date => ({
              date,
              is_present: typeof daysData[date] === 'number' && daysData[date] > 0,
              nominal: typeof daysData[date] === 'number' ? daysData[date] : 0
          }));
          const totalSalaryCell = dailyFlags.reduce((sum, d) => sum + d.nominal, 0);
          return {
              employee_id: emp.id,
              employee_name: emp.name,
              department: emp.department,
              base_salary: parseFloat(emp.base_salary),
              total_days: dailyFlags.filter(d => d.is_present).length,
              total_salary: totalSalaryCell,
              daily_records: dailyFlags
          };
      }).filter(emp => emp.total_days > 0); 

      if(!isDraft && salaryItems.length === 0) {
          alert('Belum ada karyawan yang dijadwalkan / dicentang dalam matrix gaji.');
          setSubmitting(false);
          return;
      }

      payload.payload = {
          date_range: dateRange,
          employees: salaryItems,
          total_amount: matrixGrandTotal,
          selection_mode: selectionMode,
          selected_employee_ids: selectionMode === 'manual' ? Array.from(selectedEmployeeIds) : null
      };
      
      payload.items = [];
      payload.total = matrixGrandTotal;

      const editId = searchParams.get('edit');
      let res;
      if (editId) {
          res = await api.put(`/submissions/${editId}`, payload);
      } else {
          res = await api.post('/submissions', payload);
      }
      
      const submissionId = editId || res.data.id;

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          try {
             await api.post(`/submissions/${submissionId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
             });
          } catch (uploadErr: any) {
             console.error('Failed to upload attachment:', file.name, uploadErr);
             alert(`Gagal mengunggah file lampiran: ${file.name}. Error: ${uploadErr.response?.data?.message || uploadErr.message}`);
          }
        }
      }

      // If user is editing a draft and clicking published (not draf button)
      if (editId && form.final_status === 'draf' && !isDraft) {
        await api.post(`/submissions/${editId}/publish`);
      }

      router.push('/submissions');
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Gagal mengirim pengajuan. Silakan periksa kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  if(loading) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div></Shell>;
  if(!canSubmitSalary) return null;

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-indigo-100">
                  <Users size={12} />
                  HR & GA
                </span>
                {duplicateId && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-200">
                    <Copy size={12} />
                    Mode Duplikat
                  </span>
                )}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Pengajuan <span className="text-indigo-600">Gaji Harian</span></h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">
              {duplicateId ? `Menyalin kerangka gaji dari pengajuan lama. Silakan sesuaikan kehadiran dan tanggal.` : 'Isi matrix kehadiran karyawan untuk menghitung subtotal otomatis'}
            </p>
          </div>
          <Link href="/submissions">
            <button className="text-slate-500 font-bold hover:text-slate-800 transition-all flex items-center gap-2 text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
              Batal & Kembali
            </button>
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-indigo-100 flex items-center gap-2 bg-indigo-50/50">
              <Info className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Informasi Umum</h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CalendarDays size={16} className="text-indigo-500" />
                  Tanggal Pengajuan
                </label>
                <input
                  type="date"
                  value={form.tanggal_pengajuan}
                  onChange={(e) => setForm({ ...form, tanggal_pengajuan: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${!isSuperAdmin ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed font-bold opacity-75' : 'bg-white border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 shadow-sm'} outline-none transition-all`}
                  required
                  disabled={!isSuperAdmin}
                />
              </div>
              {isSuperAdmin ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi Pembebanan</label>
                  <select
                    value={form.division_id}
                    onChange={(e) => setForm({ ...form, division_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    required
                  >
                    <option value="" className="text-slate-400">Pilih Divisi</option>
                    {lookups.divisions.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Divisi Pembebanan</label>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    {user?.division?.name} ({user?.division?.code})
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status Urgensi</label>
                <div className="flex gap-4">
                  {lookups.urgency_statuses.map((urgency: any) => (
                    <button
                      key={urgency.code}
                      type="button"
                      onClick={() => setForm({ ...form, status_urgent: urgency.code })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-bold capitalize transition-all ${form.status_urgent === urgency.code
                        ? 'border-transparent text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      style={{
                        backgroundColor: form.status_urgent === urgency.code ? urgency.color : undefined,
                        boxShadow: form.status_urgent === urgency.code ? `0 10px 15px -3px ${urgency.color}33` : undefined
                      }}
                    >
                      {urgency.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Rincian Gaji (Matrix Karyawan)
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Keterangan Pembayaran
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24"
                    placeholder="cth: Gaji Harian Karyawan Gudang Periode 1-7 Des 2024"
                    required
                  />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Tampilkan Karyawan</label>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('all')}
                      className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${selectionMode === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Tampilkan Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionMode('manual')}
                      className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${selectionMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Pilih Karyawan...
                    </button>
                  </div>

                  {selectionMode === 'manual' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Cari nama / departemen..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div className="max-h-[150px] overflow-y-auto px-1 space-y-1 custom-scrollbar">
                        {selectableEmployees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedEmployeeIds.has(emp.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}>
                              {selectedEmployeeIds.has(emp.id) && <Check size={10} />}
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={selectedEmployeeIds.has(emp.id)}
                              onChange={() => toggleEmployeeSelection(emp.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate uppercase">{emp.department}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold">
                        <span className="text-indigo-600">{selectedEmployeeIds.size} Terpilih</span>
                        <button type="button" onClick={() => setSelectedEmployeeIds(new Set())} className="text-rose-500 hover:text-rose-600">Hapus Semua</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row gap-4 lg:w-2/3">
                    <div className="flex-1">
                         <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CalendarDays size={14} /> Tanggal Mulai</label>
                         <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 bg-white shadow-sm" required />
                    </div>
                    <div className="flex-1">
                         <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CalendarDays size={14} /> Tanggal Akhir</label>
                         <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} min={dateRange.start} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 bg-white shadow-sm" required />
                    </div>
                  </div>

                  {datesArray.length > 0 && (
                      <div className="mt-6 p-5 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                  <CalendarDays size={14} className="text-indigo-500" />
                                  Pilih Hari Kerja Aktif
                              </label>
                              <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-1 rounded shadow-sm border border-slate-150">
                                  Aktif: {activeDatesArray.length} Hari
                              </span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                              {datesArray.map(date => {
                                  const dObj = new Date(date);
                                  const isExcluded = excludedDates.includes(date);
                                  return (
                                      <button 
                                        key={date}
                                        type="button"
                                        onClick={() => toggleExcludeDate(date)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center min-w-[60px] cursor-pointer ${isExcluded ? 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100 opacity-60' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm ring-1 ring-indigo-500/50'}`}
                                        title={isExcluded ? "Klik untuk mengaktifkan hari ini" : "Klik untuk menonaktifkan hari ini"}
                                      >
                                        <span className={`uppercase text-[9px] mb-0.5 tracking-wider ${isExcluded ? 'text-slate-400' : 'text-indigo-500'}`}>{dObj.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                                        <span className="text-sm">{dObj.getDate()}</span>
                                      </button>
                                  )
                              })}
                          </div>
                      </div>
                  )}

                  <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-700 text-sm">Matrix Gaji Per Hari</h3>
                            <button type="button" onClick={fillAllMatrix} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                <Zap size={12} className="text-amber-500 fill-amber-500" /> Auto-Fill (Gaji/25)
                            </button>
                            <button type="button" onClick={clearAllMatrix} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                <Trash2 size={12} /> Kosongkan
                            </button>
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm text-center uppercase hidden lg:block">Input bisa diubah manual jika perlu</span>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar bg-slate-50">
                         {activeDatesArray.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center p-6 border-b border-slate-100 bg-white m-0.5 rounded-b-xl">
                               <CalendarDays className="w-12 h-12 text-slate-200 mb-3" />
                               <p className="text-slate-500 font-bold text-sm">Pilih rentang tanggal dan hari aktif untuk memunculkan matrix absensi.</p>
                            </div>
                         ) : filteredEmployees.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 font-bold border-b border-indigo-50 bg-white m-0.5 rounded-b-xl flex flex-col items-center">
                               <Users className="w-12 h-12 text-slate-200 mb-3" />
                               Tidak ada karyawan terpilih atau aktif dalam kriteria ini.
                            </div>
                         ) : (
                            <table className="w-full min-w-max text-left border-b border-slate-200">
                              <thead>
                                 <tr>
                                   <th className="sticky left-0 z-20 bg-white border-r border-slate-200 px-4 py-3 w-64 min-w-[250px] shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-b">
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Karyawan</span>
                                          <span className="text-[10px] font-medium text-slate-400">Terpilih: {filteredEmployees.length}</span>
                                       </div>
                                   </th>
                                   {activeDatesArray.map(date => {
                                      const dObj = new Date(date);
                                      return (
                                       <th key={date} className="px-3 py-3 border-l border-b border-slate-200 bg-slate-50 text-center min-w-[120px] z-10">
                                          <div className="flex flex-col items-center gap-1.5">
                                             <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                                                 {dObj.toLocaleDateString('id-ID', { weekday: 'short' })}
                                             </span>
                                             <span className="text-xs font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-150">
                                                 {dObj.getDate()}
                                             </span>
                                          </div>
                                       </th>
                                   )})}
                                   <th className="sticky right-0 z-20 px-5 py-3 border-l border-b border-slate-200 bg-indigo-50/90 text-right w-48 text-[10px] font-black uppercase tracking-widest text-indigo-800 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] backdrop-blur-sm hidden sm:table-cell">
                                       Subtotal
                                   </th>
                                 </tr>
                              </thead>
                               <tbody className="divide-y divide-slate-100 bg-white">
                                  {filteredEmployees.map(emp => {
                                      const daysData = matrixData[emp.id] || {};
                                      const rowDatas = activeDatesArray.map(d => typeof daysData[d] === 'number' ? daysData[d] : 0);
                                      const rowCheckedCount = rowDatas.filter((val: any) => val > 0).length;
                                      const totalCellSalary = rowDatas.reduce((a: any, b: any) => a + b, 0);

                                      return (
                                      <tr key={emp.id} className="hover:bg-indigo-50/50 transition-colors group">
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-indigo-50/50 border-r border-slate-200 px-4 py-3 shadow-[4px_0_12px_rgba(0,0,0,0.03)] transition-colors">
                                          <div className="flex items-center justify-between">
                                            <div>
                                               <p className="font-bold text-sm text-slate-800 truncate block whitespace-nowrap overflow-hidden max-w-[150px]">{emp.name}</p>
                                               <p className="text-[10px] font-black tracking-widest text-slate-400 font-mono uppercase truncate block whitespace-nowrap overflow-hidden max-w-[180px]">
                                                  {emp.department} • <span className="text-emerald-600">{new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(parseFloat(emp.base_salary))}</span>/Bln
                                               </p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 ml-2">
                                                <button type="button" onClick={() => fillRow(emp.id)} className="w-5 h-5 shrink-0 rounded bg-indigo-50 hover:bg-amber-100 text-indigo-500 hover:text-amber-600 flex items-center justify-center transition-colors shadow-sm border border-indigo-100/50" title="Isi Rentang (Gaji/25)">
                                                    <Zap size={10} className="fill-current" />
                                                </button>
                                                <button type="button" onClick={() => clearRow(emp.id)} className="w-5 h-5 shrink-0 rounded bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-sm border border-slate-200" title="Kosongkan">
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                          </div>
                                        </td>
                                        {activeDatesArray.map(date => (
                                            <td key={date} className="px-2 py-2 border-l border-slate-100 text-center hover:bg-indigo-100/50 transition-colors">
                                                <input 
                                                  type="number" 
                                                  value={matrixData[emp.id]?.[date] ?? ''}
                                                  onChange={(e) => handleMatrixChange(emp.id, date, e.target.value)}
                                                  className="w-full text-center px-2 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:font-normal placeholder:text-slate-300 transition-all bg-white"
                                                  placeholder="0"
                                                  min="0"
                                                />
                                            </td>
                                        ))}
                                        <td className="sticky right-0 z-10 px-5 py-3 border-l border-slate-200 text-right bg-indigo-50/50 group-hover:bg-indigo-50 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.03)] hidden sm:table-cell">
                                          <div className="flex flex-col items-end">
                                              <span className="font-bold text-sm text-indigo-900 group-hover:text-indigo-600 transition-colors">
                                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCellSalary as number)}
                                              </span>
                                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{rowCheckedCount} Hari</span>
                                          </div>
                                        </td>
                                      </tr>
                                  )})}
                              </tbody>
                            </table>
                         )}
                      </div>
                  </div>
                  
                  <div className="bg-indigo-500 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xl shadow-indigo-500/20 text-white">
                      <span className="text-sm font-black uppercase tracking-widest text-indigo-100">Grand Total Pengajuan:</span>
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-right">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(matrixGrandTotal)}
                      </span>
                  </div>
              </motion.div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan (Opsional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24 resize-none"
                  placeholder="Tambahkan catatan tambahan jika diperlukan..."
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center gap-2 bg-slate-50/50 border-slate-100">
              <UploadCloud className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                  Lampiran Pendukung
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
               <label className="block text-sm font-semibold text-slate-700 mb-2">Upload File Dokumen / Bukti</label>
               <input 
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  className="block w-full text-sm text-slate-500 hover:file:bg-indigo-100 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 transition-all border border-slate-200 rounded-xl cursor-pointer bg-white"
               />
               <p className="text-[10px] text-slate-400 mt-2">Format yang didukung: JPG, PNG, PDF, DOCX, XLSX. Maksimal 10MB per file.</p>
               
               {files.length > 0 && (
                   <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {files.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                               <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                      <File className="w-4 h-4 text-indigo-600" />
                                   </div>
                                   <div className="truncate min-w-0">
                                      <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                   </div>
                               </div>
                               <button 
                                  type="button" 
                                  onClick={() => removeFile(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                               >
                                  <X size={16} />
                               </button>
                           </div>
                       ))}
                   </div>
               )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(new Event('submit') as any, true)}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-all text-center flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              Simpan Draf
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-70 transition-all text-lg"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {submitting ? 'Menyimpan...' : (searchParams.get('edit') && form.final_status === 'draf' ? 'TERBITKAN' : 'Simpan & Ajukan Gaji')}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

export default function NewSalarySubmissionPage() {
  return (
    <Suspense fallback={<Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32} /></div></Shell>}>
      <NewSalarySubmissionContent />
    </Suspense>
  );
}
