"use client";

import React, { useState } from 'react';
import Shell from '@/components/layout/Shell';
import { BookOpen, CheckSquare, FileText, Settings, Download, Search, FileSignature, UserCircle, Filter, Zap, BarChart3, Bell, Receipt, Shield } from 'lucide-react';
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
          title: 'Dashboard Berdasarkan Peran',
          description: 'Dashboard menyesuaikan peran Anda: Staff melihat ringkasan pengajuan pribadi. Management (GM/Director/Finance) melihat grafik tren anggaran vs realisasi, analisis kategori, ranking divisi, indikator urgensi, dan feed aktivitas real-time. Super Admin melihat statistik global sistem dan audit log.'
        },
        {
          title: 'Navigasi Dasar & Paginasi',
          description: 'Gunakan menu di sebelah kiri untuk berpindah halaman. Untuk daftar data yang panjang (seperti riwayat pengajuan), gunakan fitur Paginasi di bagian bawah tabel untuk berpindah antar halaman.'
        },
        {
          title: 'Unduh Aplikasi Mobile',
          description: 'Jika ada pembaruan aplikasi Mobile HBM, Anda akan melihat banner download di halaman Dashboard. Klik tombol tersebut untuk mengunduh versi terbaru dan ikuti instruksi instalasi di smartphone Anda.'
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
          description: 'Klik menu "Buat Pengajuan Baru". Isi divisi, status urgensi (Normal/Urgent), jenis pengajuan, judul, dan catatan. Lalu tambahkan item barang/jasa (Deskripsi, Qty, Satuan, Harga Satuan). Klik "Kirim/Ajukan" jika data sudah final untuk memulai alur persetujuan.'
        },
        {
          title: '2. Cara Membuat Pengajuan Gaji (Khusus HRD)',
          description: 'Klik menu "Pengajuan Gaji". Anda dapat melampirkan daftar gaji karyawan lewat file Excel atau menginputnya secara manual per karyawan per hari. Sistem otomatis menghitung subtotal per karyawan dan grand total.'
        },
        {
          title: '3. Menyimpan sebagai Draf',
          description: 'Jika Anda belum selesai mengisi data, klik "Simpan Draf". Pengajuan ini HANYA dapat dilihat oleh Anda dan belum masuk ke alur persetujuan. Anda dapat mengedit atau menghapusnya kapan saja dari menu "Pengajuan Saya" tab "Draf".'
        },
        {
          title: '4. Mengelola Draf & Penerbitan',
          description: 'Buka tab "Draf" di halaman Pengajuan Saya. Anda bisa: Ubah Draf (edit data), Terbitkan (kirim ke alur approval — data tidak bisa diubah lagi), atau Hapus jika tidak diperlukan.'
        },
        {
          title: '5. Duplikat Pengajuan',
          description: 'Di halaman detail pengajuan, klik tombol "Duplikat" untuk membuat pengajuan baru dengan data yang sudah terisi dari pengajuan sebelumnya. Sangat berguna untuk pengajuan rutin/berulang.'
        },
        {
          title: '6. Revisi Setelah Ditunda (Hold)',
          description: 'Jika pengajuan ditunda oleh approver, status berubah menjadi "On Hold". Tombol "Revisi Pengajuan" akan muncul agar Anda bisa memperbaiki data lalu mengajukan ulang.'
        }
      ]
    },
    {
      id: 'filter',
      title: 'Filter & Pencarian',
      icon: <Filter size={20} />,
      content: [
        {
          title: 'Pencarian',
          description: 'Gunakan kolom pencarian di halaman Pengajuan untuk mencari berdasarkan No. Pengajuan atau Deskripsi.'
        },
        {
          title: 'Tab Status',
          description: 'Gunakan tab status di bagian atas: Semua, Draf, Menunggu, Disetujui, dan Ditolak untuk menyaring pengajuan berdasarkan status.'
        },
        {
          title: 'Filter Lanjutan',
          description: 'Klik tombol "Filter" untuk membuka panel filter tambahan: Divisi (untuk Super Admin/Director/GM/Finance), Jenis Pengajuan, Urgensi (Semua/Normal/Urgent), dan Rentang Tanggal (Dari – Sampai). Klik "Reset" untuk menghapus semua filter.'
        },
        {
          title: 'Filter di Aplikasi Mobile',
          description: 'Di aplikasi mobile, filter status dan urgensi tersedia sebagai pill tabs di bagian atas layar untuk akses cepat.'
        }
      ]
    },
    {
      id: 'urgent',
      title: 'Pengajuan Mendesak (Urgent)',
      icon: <Zap size={20} />,
      content: [
        {
          title: 'Perbedaan Normal vs Urgent',
          description: 'Pengajuan Normal mengikuti alur approval berurutan sesuai hierarki. Pengajuan Urgent mengirim notifikasi ke semua approver secara bersamaan dan setiap approver boleh menyetujui tanpa menunggu giliran.'
        },
        {
          title: 'Auto-Approval Cascade (Khusus Direktur)',
          description: 'Jika Direktur menyetujui pengajuan Urgent terlebih dahulu, maka semua step di bawahnya (GM, Finance, HRD/GA, Manager) akan otomatis disetujui oleh sistem. Approval oleh role selain Direktur pada pengajuan Urgent TIDAK memicu cascade otomatis.'
        },
        {
          title: 'Indikator Visual',
          description: 'Pengajuan Urgent ditandai dengan badge merah "URGENT" di daftar dan banner "Pengajuan Mendesak" di halaman detail. Step yang otomatis disetujui oleh cascade Direktur ditandai badge "Auto-Approved" di timeline.'
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
          description: 'Buka menu "Persetujuan". Klik tombol "Mata" (Review) untuk mengecek rincian pengajuan. Anda memiliki tiga opsi:'
        },
        {
          title: 'Opsi Persetujuan',
          description: '1. Setujui (Hijau): Menyetujui dokumen secara final — wajib Tanda Tangan Digital.\n2. Tunda (Kuning): Mengembalikan dokumen ke pembuat untuk direvisi — wajib isi catatan.\n3. Tolak (Merah): Menolak pengajuan sepenuhnya — wajib isi alasan.'
        },
        {
          title: 'Fitur Proxy (Khusus Direktur)',
          description: 'Jika Direktur berhalangan, Manager/Admin dapat menyetujui atas nama Direktur dengan memilih "Tanda Tangan sebagai Proxy" dan mengunggah Bukti Kuasa. Direktur menerima notifikasi realtime setiap kali fitur ini digunakan.'
        },
        {
          title: 'Permintaan Lampiran',
          description: 'Approver dapat meminta dokumen tambahan kepada pembuat sebelum menyetujui. Pembuat akan melihat banner notifikasi di halaman detail dan dapat langsung mengunggah berkas yang diminta.'
        }
      ]
    },
    {
      id: 'realisasi',
      title: 'Monitoring Realisasi',
      icon: <Receipt size={20} />,
      content: [
        {
          title: 'Apa itu Monitoring Realisasi?',
          description: 'Menu Monitoring Realisasi menampilkan daftar pengajuan yang sudah disetujui beserta perbandingan Budget vs Realisasi Aktual. Tersedia untuk Finance, Super Admin, dan role terkait.'
        },
        {
          title: 'Status Realisasi',
          description: 'Setiap pengajuan ditandai statusnya: "Under Budget" (dana terpakai lebih sedikit), "Over Budget" (melebihi budget), atau "Sesuai Budget" (persis sama). Gunakan filter untuk menyaring berdasarkan status.'
        },
        {
          title: 'Input Data Realisasi',
          description: 'Klik kartu pengajuan untuk melihat detail dan memasukkan data realisasi. Tab "Realisasi Anggaran" juga tersedia di halaman detail setiap pengajuan.'
        }
      ]
    },
    {
      id: 'laporan',
      title: 'Laporan & Reporting',
      icon: <BarChart3 size={20} />,
      content: [
        {
          title: 'Halaman Laporan',
          description: 'Menu "Laporan Realisasi & Budget" menampilkan laporan pengajuan yang dikelompokkan per Divisi dengan kolom: No. Pengajuan, Status, Deskripsi, Budget Awal, Realisasi (Actual), dan Sisa/Selisih.'
        },
        {
          title: 'Kartu Ringkasan',
          description: 'Di bagian atas, terdapat kartu ringkasan yang menampilkan Total Tiket, Total Pengajuan vs Realisasi, dan Selisih Keseluruhan.'
        },
        {
          title: 'Cetak & Ekspor',
          description: 'Gunakan tombol "Cetak Laporan" untuk mencetak langsung dari browser, atau tombol "Ekspor ke PDF" untuk mengunduh file PDF. Filter lanjutan tersedia: Status, Divisi, Jenis Pengajuan, dan Rentang Tanggal.'
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
        },
        {
          title: 'Notifikasi & Aktivitas Real-Time',
          description: 'Ikon Lonceng di pojok kanan atas menampilkan notifikasi terbaru (approval masuk, ditolak, permintaan lampiran). Dashboard memiliki feed Aktivitas Langsung yang menunjukkan siapa menyetujui/menolak/menunda pengajuan dengan timestamp. Di mobile, notifikasi push tersedia melalui FCM.'
        }
      ]
    },
    {
      id: 'admin',
      title: 'Panel Admin (Super Admin)',
      icon: <Shield size={20} />,
      content: [
        {
          title: 'Master Data',
          description: 'Kelola data dasar sistem: Divisi (nama, kode, budget limit), Jenis Pengajuan (dengan flag Travel/Non-Travel), Status Urgensi (drag-and-drop urutan), Jenis Perjalanan, dan Satuan (UOM). Mendukung Bulk Create untuk menambah beberapa data sekaligus.'
        },
        {
          title: 'Alur Persetujuan (Approval Flow)',
          description: 'Konfigurasi alur persetujuan dinamis: atur step dasar (drag-and-drop urutan), tambahkan aturan kondisi untuk menyisipkan step tambahan berdasarkan divisi atau jenis perjalanan, dan lihat preview alur berdasarkan kombinasi kondisi aktif.'
        },
        {
          title: 'Manajemen Pengguna & Roles',
          description: 'Tambah, edit, hapus pengguna. Atur divisi, peran (roles), dan status aktif. Kelola peran dan hak akses di menu Roles.'
        },
        {
          title: 'Audit Log & Data Karyawan',
          description: 'Riwayat lengkap semua aktivitas sistem (siapa, apa, kapan). Menu Data Karyawan untuk mengelola database karyawan yang digunakan dalam pengajuan gaji.'
        },
        {
          title: 'Mobile Apps & Maintenance',
          description: 'Unggah dan kelola versi aplikasi mobile (APK/IPA) dengan progress bar. Aktifkan rilis agar muncul di Dashboard pengguna. Aktifkan/nonaktifkan Maintenance Mode untuk pemeliharaan sistem.'
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
