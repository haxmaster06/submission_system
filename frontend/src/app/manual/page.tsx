"use client";

import React, { useState } from 'react';
import Shell from '@/components/layout/Shell';
import { BookOpen, CheckSquare, FileText, Settings, Download, Search, FileSignature, UserCircle, Filter, Zap, BarChart3, Bell, Receipt, Shield, Lock, ShieldCheck, Plus, PenTool, Pause, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManualBook() {
  const [activeTab, setActiveTab] = useState('umum');
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      id: 'persiapan',
      title: 'Persiapan Awal (Wajib)',
      icon: <UserCircle size={20} />,
      content: [
        {
          title: '1. Ganti Password Default Anda',
          description: 'Untuk keamanan data, segera ganti password akun Anda saat pertama kali login. Caranya:\n1. Buka menu **Profil & Tanda Tangan** di sidebar.\n2. Klik **Tab Keamanan** (ikon Gembok) di bagian atas.\n3. Masukkan password bawaan saat ini, ketikkan password baru Anda, lalu klik tombol **Simpan Perubahan**.'
        },
        {
          title: '2. Tambahkan Tanda Tangan Digital (Khusus Approver)',
          description: 'Jika Anda menjabat sebagai Manager, Direktur, atau memiliki hak memvalidasi pengajuan, Anda WAJIB mendaftarkan tanda tangan Anda. Caranya:\n1. Buka menu **Profil & Tanda Tangan**.\n2. Klik **Tab Tanda Tangan** (ikon Perisai).\n3. Gunakan kursor/jari Anda untuk menggambar di kanvas putih, atau klik **Upload PNG** untuk mengunggah file gambar tanda tangan yang sudah ada.\n4. Klik **Simpan Tanda Tangan**.'
        },
        {
          title: '3. Melihat Informasi Akun',
          description: 'Anda dapat memastikan Email, Divisi, dan Peran (Role) Anda dengan membuka **Tab Informasi Akun** (ikon User) di halaman Profil. Jika terdapat kesalahan data divisi atau peran, segera hubungi Admin IT.'
        },
        {
          title: '4. Kenali Batas Anggaran (Limit Budget)',
          description: 'Setiap departemen memiliki limit bulanan. Indikator kuota budget dapat dipantau di halaman Beranda pada widget "Statistik Divisi". Pastikan pengajuan Anda masih dalam batas sisa budget yang tersedia.'
        }
      ]
    },
    {
      id: 'umum',
      title: 'Informasi Umum',
      icon: <BookOpen size={20} />,
      content: [
        {
          title: 'Apa itu HBM Budgeting?',
          description: 'HBM Budgeting adalah sistem pengelolaan pengajuan anggaran dan realisasi dana terpusat untuk efisiensi dan transparansi operasional perusahaan.'
        },
        {
          title: 'Memahami Halaman Beranda',
          description: 'Halaman "Beranda" adalah pusat informasi Anda. Di sini terdapat:\n1. **Indikator Sisa Budget**: Memantau sisa kuota anggaran divisi.\n2. **Grafik Analisis**: Tren pengajuan (khusus Management).\n3. **Feed Aktivitas**: Melihat riwayat aktivitas terbaru sistem.\n4. **Download Mobile Apps**: Link unduh file APK tersedia di bagian bawah atau banner Beranda.'
        },
        {
          title: 'Navigasi Sidebar',
          description: 'Sidebar kiri dikelompokkan menjadi:\n- **Menu Utama**: Beranda dan Profil.\n- **Penganggaran**: Buat Pengajuan, Pengajuan Gaji, dan Pengajuan Saya.\n- **Kontrol & Persetujuan**: Daftar Persetujuan (khusus Approver).\n- **Laporan**: Reporting dan Monitoring Realisasi.'
        }
      ]
    },
    {
      id: 'pengajuan',
      title: 'Membuat Pengajuan',
      icon: <FileText size={20} />,
      content: [
        {
          title: '1. Cara Membuat Pengajuan Reguler',
          description: 'Caranya:\n1. Klik menu **Buat Pengajuan Baru** di sidebar.\n2. Pilih **Divisi**, **Status Urgensi**, dan **Jenis Pengajuan**.\n3. Isi **Deskripsi** singkat dan **Catatan** tambahan.\n4. Masuk ke bagian **Items**: Masukkan Nama Barang, Qty, dan Harga Satuan (Sistem akan menghitung Total).\n5. Klik tombol **Kirim Pengajuan** untuk langsung mengajukan, atau **Simpan Draf** jika belum ingin dikirim.'
        },
        {
          title: '2. Cara Membuat Pengajuan Gaji (HRD)',
          description: 'Caranya:\n1. Klik menu **Pengajuan Gaji**.\n2. Isi Data Gaji Karyawan sesuai formulir yang disediakan.\n3. Anda dapat menambahkan beberapa entri sekaligus.\n4. Klik **Kirim Pengajuan**.'
        },
        {
          title: '3. Mengelola Draf Pengajuan',
          description: 'Caranya:\n1. Klik menu **Pengajuan Saya**.\n2. Klik **Tab Draf** di bagian atas daftar.\n3. Cari dokumen Anda, lalu klik icon **Pensil (Kuning)** untuk mengedit atau tombol **Terbitkan (Biru)** untuk mengirimnya ke alur persetujuan.'
        },
        {
          title: '4. Cara Duplikat Pengajuan',
          description: 'Sangat berguna jika Anda sering membuat pengajuan yang sama:\n1. Buka detail pengajuan lama Anda (yang sudah disetujui atau ditolak).\n2. Klik tombol **Duplikat** di pojok kanan atas.\n3. Sistem akan membuat draf baru dengan data yang sama. Anda cukup sesuaikan tanggal atau nominal jika perlu.'
        },
        {
          title: '5. Merevisi Pengajuan Tunda (On Hold)',
          description: 'Jika status pengajuan Anda adalah **On Hold** (Tunda),\n1. Buka detail pengajuan tersebut.\n2. Klik tombol **Revisi Pengajuan**.\n3. Perbaiki data sesuai catatan dari Approver, lalu klik **Ajukan Kembali**.'
        }
      ]
    },
    {
      id: 'filter',
      title: 'Filter & Pencarian',
      icon: <Filter size={20} />,
      content: [
        {
          title: 'Pencarian Berdasarkan Nomor/Deskripsi',
          description: 'Di halaman "Pengajuan Saya", gunakan kolom **Cari No. Pengajuan atau Deskripsi...** di bagian atas untuk menemukan dokumen dengan cepat.'
        },
        {
          title: 'Filter Status Melalui Tab',
          description: 'Gunakan tab-tab berikut untuk menyaring data dengan cepat:\n- **Semua**: Semua riwayat dokumen.\n- **Draf**: Dokumen yang belum dikirim.\n- **Menunggu**: Dokumen dalam proses approval.\n- **Disetujui**: Dokumen yang sudah tuntas disetujui.\n- **Ditolak**: Dokumen yang tidak disetujui.'
        },
        {
          title: 'Filter Lanjutan (Advanced Filter)',
          description: 'Caranya:\n1. Klik tombol **Filter** (ikon Corong).\n2. Pilih **Rentang Tanggal** (Dari - Sampai).\n3. Pilih **Jenis Pengajuan** atau **Urgensi** tertentu.\n4. Klik **Reset Semua Filter** untuk menghapus semua penyaringan.'
        }
      ]
    },
    {
      id: 'urgent',
      title: 'Pengajuan Urgent',
      icon: <Zap size={20} />,
      content: [
        {
          title: 'Aturan Pengajuan Urgent',
          description: 'Pengajuan berstatus **Urgent** tidak mengikuti urutan (Parallel Approval). Semua Approver akan menerima notifikasi sekaligus, dan siapa pun boleh menyetujui tanpa menunggu giliran.'
        },
        {
          title: 'Cascade Persetujuan Direktur',
          description: 'Jika Direktur langsung menyetujui pengajuan Urgent, maka semua tahap di bawahnya (Manager, Finance, GM) otomatis akan berstatus **Auto-Approved** oleh sistem.'
        }
      ]
    },
    {
      id: 'Persetujuan',
      title: 'Alur Persetujuan (Approval)',
      icon: <CheckSquare size={20} />,
      content: [
        {
          title: 'Langkah Melakukan Review',
          description: 'Khusus Approver:\n1. Buka menu **Persetujuan**.\n2. Di **Tab Antrean**, klik tombol **Review (Hitam)** pada dokumen yang ingin diproses.\n3. Di dalam Modal Review, Anda akan melihat **Detail Pengajuan** di sisi kiri.'
        },
        {
          title: 'Mengambil Tindakan (Action)',
          description: 'Setelah Review, gunakan panel di sisi kanan:\n- **Setujui & TTD**: Berikan tanda tangan digital dan pilih **Setujui**. (Wajib Tanda Tangan).\n- **Tunda (Hold)**: Klik tombol **Tunda (Kuning)** untuk dikembalikan ke pembuat (Wajib isi Catatan).\n- **Tolak (Reject)**: Klik tombol **Tolak (Merah)** untuk membatalkan pengajuan (Wajib isi alasan).'
        },
        {
          title: 'Persetujuan Mewakili (Proxy)',
          description: 'Jika Anda diberi wewenang mewakili Direktur:\n1. Centang kotak **Setujui mewakili Direktur (Proxy)**.\n2. Klik **Upload Instruksi** untuk mengunggah bukti (Capture chat/email).\n3. Berikan tanda tangan Anda untuk memvalidasi.'
        }
      ]
    },
    {
      id: 'realisasi',
      title: 'Monitoring Realisasi',
      icon: <Receipt size={20} />,
      content: [
        {
          title: 'Cara Monitoring Budget vs Realisasi',
          description: '1. Buka menu **Monitoring Realisasi**.\n2. Cari pengajuan yang ingin dipantau.\n3. Perhatikan label indikator: **Under Budget** (Hijau) atau **Over Budget** (Merah).\n4. Klik kartu pengajuan untuk melihat rincian pemakaian aktual pada tab **Realisasi Anggaran**.'
        }
      ]
    },
    {
      id: 'laporan',
      title: 'Reporting & Analysis',
      icon: <BarChart3 size={20} />,
      content: [
        {
          title: 'Cara Melihat Laporan Per Divisi',
          description: '1. Buka menu **Reporting**.\n2. Pilih **Filter Status** (sebaiknya pilih "Disetujui" untuk data realisasi akurat).\n3. Laporan akan dikelompokkan secara otomatis berdasarkan Divisi.'
        },
        {
          title: 'Memahami Total Budget di Laporan',
          description: 'Laporan ini hanya menjumlahkan pengajuan yang sudah berstatus **Approved**. Data yang masih Draf atau Pending tidak akan dihitung masuk ke dalam **Subtotal Budget (Approved)**.'
        },
        {
          title: 'Ekspor Laporan ke PDF',
          description: 'Klik tombol **Ekspor ke PDF** di pojok kanan atas untuk mengunduh laporan dalam format dokumen resmi yang siap dicetak.'
        }
      ]
    },
    {
      id: 'Print',
      title: 'Cetak & Unduh Dokumen',
      icon: <Download size={20} />,
      content: [
        {
          title: 'Cara Mencetak Bukti Pengajuan',
          description: '1. Buka detail pengajuan di menu **Pengajuan Saya**.\n2. Klik tombol **Print / PDF** di pojok kanan bawah detail.\n3. Sistem akan menghasilkan dokumen A4 lengkap dengan riwayat tanda tangan digital dan barcode keamanan.'
        }
      ]
    },
    {
      id: 'Profile',
      title: 'Profil & Keamanan',
      icon: <FileSignature size={20} />,
      content: [
        {
          title: 'Kelola Tanda Tangan Digital',
          description: 'Selalu pastikan tanda tangan Anda sudah terdaftar di **Tab Tanda Tangan**. Jika ingin mengganti, cukup klik **Clear** lalu gambar ulang atau unggah file baru.'
        },
        {
          title: 'Notifikasi & Lonceng',
          description: 'Klik ikon **Lonceng** di header (pojok kanan atas) untuk melihat riwayat aktivitas terbaru. Badge merah menandakan ada pemberitahuan baru yang belum dibaca.'
        }
      ]
    },
    {
      id: 'admin',
      title: 'Panel Admin (Super Admin)',
      icon: <Shield size={20} />,
      content: [
        {
          title: 'Pengelolaan Master Data',
          description: '1. Buka menu **Master Data**.\n2. Pilih kategori (Divisi, UOM, Jenis Pengajuan, dll).\n3. Gunakan tombol **Tambah** untuk entri satu per satu atau **Bulk Create** untuk upload banyak data sekaligus.'
        },
        {
          title: 'Pengaturan Alur (Approval Flow)',
          description: 'Buka menu **Alur Persetujuan**. Gunakan fitur **Drag & Drop** untuk mengubah posisi tahap persetujuan. Klik **Tambah Step** untuk menyisipkan alur baru.'
        }
      ]
    }
  ];

  // Filter guides based on search
  const filteredGuides = guides.map(category => ({
    ...category,
    content: category.content.filter(
      item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.content.length > 0);

  const activeGuideCategory = filteredGuides.find(g => g.id === activeTab) || filteredGuides[0] || { id: 'empty', title: '', icon: null, content: [] };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-[32px] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-md border border-white/10">
                <BookOpen size={16} />
                Bantuan & Panduan
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                Bagaimana kami bisa <br />membantu Anda?
              </h1>
              <p className="text-sky-100 text-lg leading-relaxed max-w-xl">
                Temukan panduan lengkap tentang cara menggunakan sistem HBM Budgeting, mulai dari pembuatan pengajuan hingga alur persetujuan.
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full md:w-80 shrink-0 relative">
              <input
                type="text"
                placeholder="Cari topik bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-sky-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all backdrop-blur-md"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-200" size={20} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 sticky top-28">
              {guides.map((category) => {
                const isActive = activeTab === category.id;
                // Check if this category has results when filtering
                const hasResults = filteredGuides.some(g => g.id === category.id);
                
                if (searchQuery && !hasResults) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <div className={isActive ? 'text-sky-500' : 'text-slate-400'}>
                      {category.icon}
                    </div>
                    <span className="font-bold text-sm text-left">{category.title}</span>
                    {isActive && (
                      <motion.div layoutId="activeGuideTab" className="ml-auto w-1.5 h-1.5 bg-sky-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guide Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-slate-100 min-h-[500px]">
              {filteredGuides.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                  <BookOpen size={48} className="text-slate-200 mb-4" />
                  <p className="text-lg font-bold text-slate-600">Topik tidak ditemukan</p>
                  <p className="text-sm">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeGuideCategory?.id || 'empty'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shadow-inner">
                        {activeGuideCategory?.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-800">{activeGuideCategory?.title}</h2>
                        <p className="text-slate-500 font-medium">Kumpulan panduan seputar {activeGuideCategory?.title.toLowerCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {activeGuideCategory?.content.map((item, idx) => (
                        <div key={idx} className="group flex gap-4">
                          <div className="hidden sm:flex flex-col items-center mt-1 shrink-0">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                              {idx + 1}
                            </div>
                            {idx !== activeGuideCategory.content.length - 1 && (
                              <div className="w-px h-full bg-slate-100 group-hover:bg-sky-50/50 my-2 transition-colors"></div>
                            )}
                          </div>
                          <div className="bg-slate-50 hover:bg-slate-100/80 p-6 rounded-2xl flex-1 transition-colors border border-slate-100/50 group-hover:border-slate-200/50">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                            <pre className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-sans">
                              {item.description}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
