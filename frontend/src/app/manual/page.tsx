"use client";

import React, { useState } from 'react';
import Shell from '@/components/layout/Shell';
import { BookOpen, CheckSquare, FileText, Settings, Download, Search, FileSignature, UserCircle } from 'lucide-react';
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
          description: 'Untuk keamanan data, segera ganti password akun Anda saat pertama kali login. Buka menu "Profil & Tanda Tangan" di pojok kiri atas, scroll ke bawah ke bagian Ubah Password. Masukkan password bawaan saat ini, lalu ketikkan password baru Anda dan simpan.'
        },
        {
          title: '2. Tambahkan Tanda Tangan Digital (Khusus Approver)',
          description: 'Jika Anda menjabat sebagai manajer, direktur, atau memiliki hak memvalidasi pengajuan, Anda WAJIB mendaftarkan tanda tangan Anda. Buka menu "Profil & Tanda Tangan", lalu gunakan kursor/jari tangan Anda untuk menggambar di kanvas yang tersedia, atau upload gambar tanda tangan Anda dengan format PNG. Terdapat pratinjau stempel di bagian tersebut untuk memastikan tanda tangan Anda terlihat rapi.'
        },
        {
          title: '3. Memahami Peran (Roles)',
          description: 'Sistem ini mendukung lebih dari satu peran untuk satu pengguna. Anda dapat melihat peran Anda di bawah nama pada menu profil. Peran menentukan hak akses Anda terhadap fitur-fitur tertentu.'
        },
        {
          title: '4. Kenali Batas Anggaran (Limit Budget)',
          description: 'Pastikan Anda mengetahui bahwa persetujuan dan pembuatan budget tunduk pada limit bulanan departemen. Semua ini dicatat secara otomatis oleh sistem.'
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
          title: 'Navigasi Dasar',
          description: 'Anda dapat menggunakan menu di sebelah kiri untuk berpindah halaman. "Beranda" untuk melihat ringkasan, "Buat Pengajuan Baru" untuk merancang pengajuan dana, dan "Pengajuan Saya" untuk memantau status pengajuan Anda.'
        }
      ]
    },
    {
      id: 'pengajuan',
      title: 'Membuat Pengajuan',
      icon: <FileText size={20} />,
      content: [
        {
          title: '1. Menyimpan sebagai Draf',
          description: 'Jika Anda belum selesai mengisi data, klik "Simpan Draf". Pengajuan ini HANYA dapat dilihat oleh Anda dan belum masuk ke alur persetujuan. Anda dapat mengedit atau menghapusnya kapan saja dari menu "Pengajuan Saya" tab "Draf".'
        },
        {
          title: '2. Cara Membuat Pengajuan Reguler',
          description: 'Klik menu "Buat Pengajuan Baru". Isi formulir utama. Lalu tambahkan item barang/jasa. Klik "Kirim/Ajukan" jika data sudah final untuk memulai alur persetujuan.'
        },
        {
          title: '3. Cara Membuat Pengajuan Gaji (Khusus HRD)',
          description: 'Klik menu "Pengajuan Gaji". Anda dapat melampirkan daftar gaji karyawan lewat file Excel atau menginputnya secara manual.'
        },
        {
          title: '4. Mengelola Draf Anda',
          description: 'Buka menu "Pengajuan Saya" dan pilih tab "Draf". Di sini Anda dapat membuka kembali draf untuk diedit (Ubah Draf), menerbitkannya (Terbitkan), atau menghapusnya jika tidak lagi diperlukan.'
        }
      ]
    },
    {
      id: 'Persetujuan',
      title: 'Alur Persetujuan (Approval)',
      icon: <CheckSquare size={20} />,
      content: [
        {
          title: 'Bagi Pembuat Pengajuan',
          description: 'Setelah pengajuan dibuat, statusnya adalah "Pending". Pengajuan tersebut akan masuk ke antrean Manager divisi Anda, lalu berantai ke HRD/GA, Tim Keuangan (Finance), General Manager, dan terakhir Direktur Utama. Sistem akan memberi notifikasi (ikon lonceng) setiap kali dokumen Anda disetujui / ditolak pada tiap tahap.'
        },
        {
          title: 'Bagi Pihak Penyetuju (Approver)',
          description: 'Buka menu "Persetujuan". Anda akan melihat seluruh dokumen yang menunggu tanda tangan Anda. Klik tombol "Mata" untuk mengecek rincian pengajuan. Anda bida menekan tombol hijau untuk Menyetujui, atau tombol merah untuk Menolak (wajib menyertakan catatan penolakan).'
        }
      ]
    },
    {
      id: 'Print',
      title: 'Cetak & Unduh (PDF)',
      icon: <Download size={20} />,
      content: [
        {
          title: 'Mencetak Bukti Pengajuan',
          description: 'Buka menu "Pengajuan Saya", klik detail pengajuan Anda. Di pojok kanan atas terdapat tombol "Print / PDF". Sistem akan merangkum seluruh rincian barang, total biaya, dan barcode persetujuan ke dalam dokumen ukuran A4 yang rapi.'
        }
      ]
    },
    {
      id: 'Profile',
      title: 'Pengaturan & Tanda Tangan',
      icon: <FileSignature size={20} />,
      content: [
        {
          title: 'Menambah Tanda Tangan Digital',
          description: 'Wajib bagi Approver! Buka menu "Profil & Tanda Tangan". Anda dapat menggambar langsung tanda tangan di layar atau mengunggah gambar tanda tangan Anda. Tanda tangan ini akan dicetak otomatis di bagian bawah dokumen pengajuan ketika Anda menyetujuinya.'
        },
        {
          title: 'Mengganti Password',
          description: 'Di menu Profil yang sama, masukkan password lama Anda lalu masukkan password baru untuk mengamankan akun.'
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

  const activeGuideCategory = filteredGuides.find(g => g.id === activeTab) || filteredGuides[0];

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
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
                            <p className="text-slate-600 leading-relaxed text-sm">
                              {item.description}
                            </p>
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
