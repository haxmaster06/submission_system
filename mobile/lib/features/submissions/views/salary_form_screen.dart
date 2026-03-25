import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';

class SalaryFormScreen extends ConsumerStatefulWidget {
  const SalaryFormScreen({super.key});

  @override
  ConsumerState<SalaryFormScreen> createState() => _SalaryFormScreenState();
}

class _SalaryFormScreenState extends ConsumerState<SalaryFormScreen> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      appBar: AppBar(
        title: const Text('Buat Pengajuan Gaji'),
        backgroundColor: Colors.white,
        foregroundColor: UiKit.textBlack,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: UiKit.borderRadiusCard,
                  border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: Colors.blue),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Pilih Karyawan dan tentukan jumlah hari kerja untuk membuat rekap permohonan gaji harian.',
                        style: UiKit.bodyText.copyWith(color: Colors.blue.shade900),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text('Data Pengajuan', style: UiKit.heading2),
              const SizedBox(height: 16),

              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Deskripsi / Keterangan',
                  hintText: 'Misal: Gaji Harian Minggu I Maret 2026',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Wajib diisi' : null,
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Daftar Karyawan', style: UiKit.heading2),
                  TextButton.icon(
                    onPressed: () {
                      // TODO: Show employee picker modal
                    },
                    icon: const Icon(Icons.person_add),
                    label: const Text('Tambah'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Placeholder List
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: UiKit.borderRadiusCard,
                ),
                child: const Center(
                  child: Text('Belum ada karyawan yang ditambahkan', style: UiKit.caption),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              context.pop();
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: UiKit.primaryBlue,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Ajukan Sekarang', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}
