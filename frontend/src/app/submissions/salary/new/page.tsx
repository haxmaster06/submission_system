"use client";

import { useState, useEffect, useMemo } from 'react';
import Shell from '@/components/layout/Shell';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Save, Send, Loader2, Info, Users, CalendarDays, Check, FileText, Trash2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function NewSalarySubmissionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [employees, setEmployees] = useState<any[]>([]);
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
  });

  useEffect(() => {
     if (user && !canSubmitSalary) {
         router.push('/submissions');
     }
  }, [user, canSubmitSalary, router]);

  useEffect(() => {
    Promise.all([
      api.get('/lookups'),
      api.get('/master/employees').catch(() => ({ data: [] }))
    ]).then(([lookupsRes, empRes]) => {
      setLookups(lookupsRes.data);
      if (empRes.data.length > 0) {
        setEmployees(empRes.data.filter((e: any) => e.is_active));
      }
      
      const salaryType = lookupsRes.data.jenis_pengajuan?.find((j: any) => j.name?.toLowerCase().includes('gaji karyawan harian'));
      if(salaryType) {
          setForm(prev => ({ ...prev, jenis_pengajuan_id: String(salaryType.id) }));
      }
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

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

  const fillAllMatrix = () => {
    setMatrixData(prev => {
      const newMatrix = { ...prev };
      employees.forEach(emp => {
        if (!newMatrix[emp.id]) newMatrix[emp.id] = {};
        const dailyRate = Math.round(parseFloat(emp.base_salary) / 25);
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
      const dailyRate = Math.round(parseFloat(emp.base_salary) / 25);
      const rowUpdates: Record<string, number> = {};
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
  };

  const matrixGrandTotal = useMemo(() => {
    let total = 0;
    Object.values(matrixData).forEach(dates => {
      Object.entries(dates).forEach(([dateStr, val]) => {
        if (activeDatesArray.includes(dateStr) && typeof val === 'number') total += val;
      });
    });
    return total;
  }, [matrixData, activeDatesArray]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (datesArray.length === 0) {
      alert('Pilih rentang tanggal (Start Date & End Date) terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      let payload: any = { ...form };
      
      const salaryItems = employees.map(emp => {
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

      if(salaryItems.length === 0) {
          alert('Belum ada karyawan yang dijadwalkan / dicentang dalam matrix gaji.');
          setSubmitting(false);
          return;
      }

      payload.payload = {
          date_range: dateRange,
          employees: salaryItems,
          total_amount: matrixGrandTotal
      };
      
      payload.items = [];
      payload.total = matrixGrandTotal;

      await api.post('/submissions', payload);
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
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Pengajuan <span className="text-indigo-600">Gaji Harian</span></h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">Isi matrix kehadiran karyawan untuk menghitung subtotal otomatis</p>
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
                         ) : employees.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 font-bold border-b border-indigo-50 bg-white m-0.5 rounded-b-xl">
                               Tidak ada data karyawan aktif. Silakan tambahkan di Master Data.
                            </div>
                         ) : (
                            <table className="w-full min-w-max text-left border-b border-slate-200">
                              <thead>
                                 <tr>
                                   <th className="sticky left-0 z-20 bg-white border-r border-slate-200 px-4 py-3 w-64 min-w-[250px] shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-b">
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Karyawan</span>
                                          <span className="text-[10px] font-medium text-slate-400">Total Karyawan: {employees.length}</span>
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
                                  {employees.map(emp => {
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
                                                  {emp.department} • <span className="text-emerald-600">{new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(parseFloat(emp.base_salary))}</span>/Ref
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-70 transition-all text-lg"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
              {submitting ? 'Menyimpan...' : 'Simpan & Ajukan Gaji'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
