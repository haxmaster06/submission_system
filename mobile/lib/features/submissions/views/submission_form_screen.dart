import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';
import 'package:mobile/features/submissions/providers/submission_list_provider.dart';
import 'package:mobile/features/auth/models/user_model.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/submissions/repositories/submission_repository.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/features/submissions/models/submission_model.dart';

class SubmissionFormScreen extends ConsumerStatefulWidget {
  final Submission? submission;
  const SubmissionFormScreen({super.key, this.submission});

  @override
  ConsumerState<SubmissionFormScreen> createState() =>
      _SubmissionFormScreenState();
}

class _SubmissionFormScreenState extends ConsumerState<SubmissionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _notesController = TextEditingController();
  final _employeeSearchController = TextEditingController();

  int? _jenisPengajuanId;
  int? _divisionId;
  int? _jenisPerjalananId;
  String _statusUrgent = 'normal';
  DateTime? _startDate;
  DateTime? _endDate;

  List<dynamic> _divisions = [];
  List<dynamic> _jenisPengajuanList = [];
  List<dynamic> _jenisPerjalananList = [];
  List<dynamic> _uomList = [];
  List<dynamic> _urgencyStatuses = [];
  List<dynamic> _employees = [];
  bool _isLoadingLookups = true;

  final List<Map<String, dynamic>> _details = [];
  final Map<int, Map<String, double>> _salaryMatrix =
      {}; // employeeId -> {dateStr: amount}
  List<String> _excludedDates = [];
  bool _isSubmitting = false;
  bool _isLoadingEmployees = false;
  String? _employeeFetchError;

  String _selectionMode = 'all'; // 'all' or 'manual'
  final Set<int> _selectedEmployeeIds = {};

  @override
  void initState() {
    super.initState();
    if (widget.submission != null) {
      _prepopulateData();
    }
    _fetchData();
  }

  void _prepopulateData() {
    final sub = widget.submission!;
    _descriptionController.text = sub.description ?? '';
    _notesController.text = sub.notes;
    // We set IDs during _fetchData so they match lookup items
    _statusUrgent = sub.isUrgent ? 'urgent' : 'normal';

    if (sub.payload != null && sub.payload!['type'] == 'salary') {
      try {
        final startStr = sub.payload!['date_range']['start'];
        final endStr = sub.payload!['date_range']['end'];
        _startDate = DateTime.parse(startStr);
        _endDate = DateTime.parse(endStr);

        final List employees = sub.payload!['employees'] ?? [];
        _selectionMode = 'manual';
        for (final emp in employees) {
          final empId = emp['employee_id'];
          _selectedEmployeeIds.add(empId);
          final List dailyRecords = emp['daily_records'] ?? [];
          _salaryMatrix[empId] = {};
          for (final rec in dailyRecords) {
            _salaryMatrix[empId]![rec['date']] =
                double.tryParse(rec['nominal'].toString()) ?? 0.0;
          }
        }
      } catch (e) {
        debugPrint('Error prepopulating salary data: $e');
      }
    } else {
      for (final detail in sub.details) {
        _details.add({
          'id': detail.id,
          'description': TextEditingController(text: detail.description),
          'amount': TextEditingController(
            text: detail.amount.toStringAsFixed(0),
          ),
          'qty': TextEditingController(
            text: '1',
          ), // Fallback if qty not in model
          'uom_id': null, // Will be matched in fetchData if possible
        });
      }
    }
  }

  Future<void> _fetchData() async {
    final dio = ref.read(dioProvider);
    final user = ref
        .read(authProvider)
        .maybeWhen(authenticated: (u) => u, orElse: () => null);

    try {
      final res = await dio.get('/lookups');
      final data = res.data;

      if (mounted) {
        setState(() {
          _divisions = data['divisions'] ?? [];
          _jenisPengajuanList = data['jenis_pengajuan'] ?? [];

          // Filter "Gaji Karyawan Harian" based on permission
          if (user != null) {
            final canManageEmp =
                user.hasPermission('manage employees') || user.isSuperAdmin;
            if (!canManageEmp) {
              _jenisPengajuanList.removeWhere(
                (j) => j['name'].toString().toLowerCase().contains('gaji'),
              );
            }
          }

          _jenisPerjalananList = data['jenis_perjalanan'] ?? [];
          _uomList = data['uoms'] ?? [];
          _urgencyStatuses = data['urgency_statuses'] ?? [];

          if (_jenisPengajuanId == null && _jenisPengajuanList.isNotEmpty) {
            _jenisPengajuanId = _jenisPengajuanList.first['id'];
          }

          if (user != null) {
            _divisionId = user.divisionId;
          }

          _isLoadingLookups = false;
        });
      }

      // If it's potentially a salary submission, fetch employees
      if (user != null &&
          (user.hasPermission('manage employees') || user.isSuperAdmin)) {
        _fetchEmployees();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingLookups = false);
      }
    }
  }

  Future<void> _fetchEmployees() async {
    if (_isLoadingEmployees) return;

    setState(() {
      _isLoadingEmployees = true;
      _employeeFetchError = null;
    });

    try {
      final dio = ref.read(dioProvider);
      final resEmp = await dio.get('/master/employees');
      if (mounted) {
        setState(() {
          _employees = (resEmp.data as List)
              .where((e) => e['is_active'] == 1 || e['is_active'] == true)
              .toList();
          _isLoadingEmployees = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingEmployees = false;
          _employeeFetchError = "Gagal memuat data karyawan";
        });
      }
    }
  }

  void _openDetailsModal({int? index}) {
    final bool isEditing = index != null;
    final row = isEditing ? _details[index] : null;
    final descCtrl = TextEditingController(
      text: row?['description']?.text ?? '',
    );
    final amountCtrl = TextEditingController(text: row?['amount']?.text ?? '');
    final qtyCtrl = TextEditingController(text: row?['qty']?.text ?? '1');
    int? localUomId =
        row?['uom_id'] ?? (_uomList.isNotEmpty ? _uomList.first['id'] : null);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          top: 32,
          left: 24,
          right: 24,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isEditing ? 'Ubah Item' : 'Tambah Item',
              style: UiKit.heading2,
            ),
            const SizedBox(height: 24),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(labelText: 'Deskripsi'),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: amountCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Nominal (Rp)',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: qtyCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'QTY'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<int>(
              value: localUomId,
              decoration: const InputDecoration(labelText: 'Satuan (UOM)'),
              items: _uomList
                  .map(
                    (u) => DropdownMenuItem<int>(
                      value: u['id'],
                      child: Text(u['name'] ?? u['code']),
                    ),
                  )
                  .toList(),
              onChanged: (v) => localUomId = v,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                if (descCtrl.text.isEmpty || amountCtrl.text.isEmpty) return;
                setState(() {
                  if (isEditing) {
                    _details[index]['description'].text = descCtrl.text;
                    _details[index]['amount'].text = amountCtrl.text;
                    _details[index]['qty'].text = qtyCtrl.text;
                    _details[index]['uom_id'] = localUomId;
                  } else {
                    _details.add({
                      'description': TextEditingController(text: descCtrl.text),
                      'amount': TextEditingController(text: amountCtrl.text),
                      'uom_id': localUomId,
                      'qty': TextEditingController(text: qtyCtrl.text),
                    });
                  }
                });
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(55),
              ),
              child: Text(isEditing ? 'Simpan Perubahan' : 'Tambah Ke Daftar'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm({bool isDraft = false}) async {
    if (!_formKey.currentState!.validate()) return;
    final user = ref
        .read(authProvider)
        .maybeWhen(authenticated: (u) => u, orElse: () => null);
    if (user == null) return;

    setState(() => _isSubmitting = true);
    try {
      final repo = ref.read(submissionRepositoryProvider);
      final bool isDraftInput = isDraft;

      // Check Mode
      final selectedType = _jenisPengajuanList.firstWhere(
        (element) => element['id'] == _jenisPengajuanId,
        orElse: () => null,
      );
      final isSalaryMode =
          selectedType != null &&
          selectedType['name'].toString().toLowerCase().contains('gaji');

      List<Map<String, dynamic>>? items;
      Map<String, dynamic>? payload;
      double? total;

      if (isSalaryMode) {
        if (_startDate == null || _endDate == null) {
          throw Exception('Pilih periode tanggal');
        }
        if (_salaryMatrix.isEmpty) {
          throw Exception('Pilih minimal satu karyawan');
        }

        // Construct employees payload compatible with backend template
        final datesInRange = _getDatesInRange();
        final dates = datesInRange
            .map((d) => DateFormat('yyyy-MM-dd').format(d))
            .toList();

        final employeesPayload = _salaryMatrix.entries
            .where((e) {
              if (_selectionMode == 'all') return true;
              return _selectedEmployeeIds.contains(e.key);
            })
            .map((e) {
              final emp = _employees.firstWhere((emp) => emp['id'] == e.key);
              final matrix = e.value;

              final dailyRecords = dates.map((dateStr) {
                final nominal = matrix[dateStr] ?? 0.0;
                return {
                  'date': dateStr,
                  'is_present': nominal > 0,
                  'nominal': nominal,
                };
              }).toList();

              final rowTotal = dailyRecords.fold<double>(
                0.0,
                (sum, item) => sum + (item['nominal'] as double),
              );
              final activeDays = dailyRecords
                  .where((r) => r['is_present'] == true)
                  .length;

              return {
                'employee_id': e.key,
                'employee_name': emp['name'],
                'department': emp['division_name'] ?? '-',
                'base_salary':
                    double.tryParse(emp['base_salary'].toString()) ?? 0.0,
                'total_days': activeDays,
                'total_salary': rowTotal,
                'daily_records': dailyRecords,
              };
            })
            .where((emp) => (emp['total_days'] as int) > 0)
            .toList();

        total = employeesPayload.fold<double>(
          0.0,
          (sum, item) => sum + (item['total_salary'] as double),
        );

        payload = {
          'type': 'salary',
          'date_range': {
            'start': DateFormat('yyyy-MM-dd').format(_startDate!),
            'end': DateFormat('yyyy-MM-dd').format(_endDate!),
          },
          'employees': employeesPayload,
          'total_amount': total,
        };
      } else {
        items = _details
            .map(
              (d) => {
                'description': d['description'].text,
                'nominal':
                    double.tryParse(
                      d['amount'].text.replaceAll(RegExp(r'[^0-9]'), ''),
                    ) ??
                    0.0,
                'qty': double.tryParse(d['qty'].text) ?? 1.0,
                'uom_id': d['uom_id'] ?? 1,
              },
            )
            .toList();
      }

      if (widget.submission != null) {
        await repo.updateSubmission(
          widget.submission!.id,
          divisionId: _divisionId ?? user.divisionId ?? 1,
          jenisPengajuanId: _jenisPengajuanId ?? 1,
          statusUrgent: _statusUrgent,
          description: _descriptionController.text,
          notes: _notesController.text,
          items: items,
          payload: payload,
          total: total,
        );

        // If editing a draft and clicking 'Terbitkan' (isDraftInput == false), publish it now
        if (!isDraftInput && widget.submission!.status == 'draf') {
          await repo.publishSubmission(widget.submission!.id);
        }
      } else {
        await repo.createSubmission(
          divisionId: _divisionId ?? user.divisionId ?? 1,
          jenisPengajuanId: _jenisPengajuanId ?? 1,
          statusUrgent: _statusUrgent,
          description: _descriptionController.text,
          notes: _notesController.text,
          items: items,
          payload: payload,
          total: total,
          isDraft: isDraftInput,
        );
      }

      if (mounted) {
        ref.read(submissionListProvider.notifier).refresh();
        context.pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isDraftInput ? 'Draf disimpan' : 'Berhasil diajukan'),
          ),
        );
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingLookups)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final authState = ref.watch(authProvider);
    final user = authState.maybeWhen(
      authenticated: (u) => u,
      orElse: () => null,
    );
    final isSuperAdmin = user?.roleName == 'Super Admin';

    // Check if selected type is "Gaji Karyawan Harian"
    final selectedType = _jenisPengajuanList.firstWhere(
      (element) => element['id'] == _jenisPengajuanId,
      orElse: () => null,
    );
    final isSalaryMode =
        selectedType != null &&
        selectedType['name'].toString().toLowerCase().contains('gaji');

    // Check if selected type is "Perjalanan Dinas" or similar
    final isTravelMode =
        selectedType != null &&
        selectedType['name'].toString().toLowerCase().contains('perjalanan');

    return Scaffold(
      backgroundColor: UiKit.backgroundGray,
      body: CustomScrollView(
        slivers: [
          _buildSliverHeader(),
          SliverToBoxAdapter(
            child: Container(
              transform: Matrix4.translationValues(0, -30, 0),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
              ),
              padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Informasi Utama', style: UiKit.heading3),
                    const SizedBox(height: 16),
                    if (isSuperAdmin) ...[
                      DropdownButtonFormField<int>(
                        value: _divisionId,
                        decoration: InputDecoration(
                          labelText: 'Pilih Divisi (Admin Only)',
                          labelStyle: TextStyle(
                            fontSize: 14,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        items: _divisions
                            .map(
                              (d) => DropdownMenuItem<int>(
                                value: d['id'],
                                child: Text(d['name']),
                              ),
                            )
                            .toList(),
                        isExpanded: true,
                        onChanged: (v) => setState(() => _divisionId = v),
                      ),
                      const SizedBox(height: 16),
                    ],
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Judul Pengajuan',
                        hintText: 'Contoh: Reimbursement Perjalanan Dinas',
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<int>(
                      value: _jenisPengajuanId,
                      decoration: const InputDecoration(
                        labelText: 'Jenis Pengajuan',
                      ),
                      items: _jenisPengajuanList
                          .map(
                            (j) => DropdownMenuItem<int>(
                              value: j['id'],
                              child: Text(j['name']),
                            ),
                          )
                          .toList(),
                      isExpanded: true,
                      onChanged: (v) => setState(() {
                        _jenisPengajuanId = v;
                        _jenisPerjalananId =
                            null; // Reset travel type if changed
                      }),
                    ),
                    if (isTravelMode) ...[
                      const SizedBox(height: 16),
                      DropdownButtonFormField<int>(
                        value: _jenisPerjalananId,
                        decoration: const InputDecoration(
                          labelText: 'Kategori Perjalanan',
                        ),
                        items: _jenisPerjalananList
                            .map(
                              (j) => DropdownMenuItem<int>(
                                value: j['id'],
                                child: Text(j['name']),
                              ),
                            )
                            .toList(),
                        isExpanded: true,
                        onChanged: (v) =>
                            setState(() => _jenisPerjalananId = v),
                      ),
                    ],
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _statusUrgent,
                      decoration: const InputDecoration(
                        labelText: 'Status Urgensi',
                      ),
                      items: _urgencyStatuses.isNotEmpty
                          ? _urgencyStatuses
                                .map(
                                  (s) => DropdownMenuItem<String>(
                                    value: s['code'],
                                    child: Text(s['name']),
                                  ),
                                )
                                .toList()
                          : const [
                              DropdownMenuItem(
                                value: 'normal',
                                child: Text('Normal'),
                              ),
                              DropdownMenuItem(
                                value: 'urgent',
                                child: Text('Mendesak'),
                              ),
                            ],
                      isExpanded: true,
                      onChanged: (v) => setState(() => _statusUrgent = v!),
                    ),
                    const SizedBox(height: 32),

                    if (isSalaryMode)
                      _buildSalarySection()
                    else ...[
                      const Text('Rincian Item', style: UiKit.heading3),
                      const SizedBox(height: 16),
                      ..._details.asMap().entries.map(
                        (e) => _buildItemTile(e.value, e.key),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => _openDetailsModal(),
                        icon: const Icon(Icons.add),
                        label: const Text('Tambah Item Baru'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                        ),
                      ),
                    ],

                    const SizedBox(height: 32),
                    const Text('Catatan (Opsional)', style: UiKit.heading3),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Tambahkan keterangan jika perlu...',
                      ),
                    ),
                    const SizedBox(height: 48),
                    if (_isSubmitting)
                      const Center(child: CircularProgressIndicator())
                    else
                      Column(
                        children: [
                          ElevatedButton(
                            onPressed: () => _submitForm(isDraft: false),
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size.fromHeight(60),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                            ),
                            child: Text(
                              (widget.submission != null &&
                                      widget.submission!.status == 'draf')
                                  ? 'TERBITKAN'
                                  : 'SIMPAN & AJUKAN',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          OutlinedButton(
                            onPressed: () => _submitForm(isDraft: true),
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size.fromHeight(60),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(15),
                              ),
                            ),
                            child: const Text(
                              'SIMPAN SEBAGAI DRAF',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<DateTime> _getDatesInRange() {
    if (_startDate == null || _endDate == null) return [];
    final days = _endDate!.difference(_startDate!).inDays + 1;
    return List.generate(
      days > 31 ? 31 : days, // Limit to 31 days to avoid UI crash
      (i) => _startDate!.add(Duration(days: i)),
    );
  }

  void _autoFillAll() {
    final dates = _getDatesInRange();
    final activeDates = dates
        .map((d) => DateFormat('yyyy-MM-dd').format(d))
        .where((d) => !_excludedDates.contains(d))
        .toList();

    setState(() {
      final targetEmployees = _selectionMode == 'all' 
          ? _employees 
          : _employees.where((e) => _selectedEmployeeIds.contains(e['id']));
          
      for (final emp in targetEmployees) {
        final empId = emp['id'] as int;
        final baseSalary =
            double.tryParse(emp['base_salary'].toString()) ?? 0.0;
        final dailyRate = (baseSalary / 25).roundToDouble();

        _salaryMatrix[empId] ??= {};
        for (final dateStr in activeDates) {
          _salaryMatrix[empId]![dateStr] = dailyRate;
        }
      }
    });
  }

  void _autoFillRow(int empId) {
    final emp = _employees.firstWhere((e) => e['id'] == empId);
    final baseSalary = double.tryParse(emp['base_salary'].toString()) ?? 0.0;
    final dailyRate = (baseSalary / 25).roundToDouble();
    final dates = _getDatesInRange();
    final activeDates = dates
        .map((d) => DateFormat('yyyy-MM-dd').format(d))
        .where((d) => !_excludedDates.contains(d))
        .toList();

    setState(() {
      _salaryMatrix[empId] ??= {};
      for (final dateStr in activeDates) {
        _salaryMatrix[empId]![dateStr] = dailyRate;
      }
    });
  }

  void _resetMatrix() {
    setState(() {
      _salaryMatrix.clear();
    });
  }

  Widget _buildSalarySection() {
    final dates = _getDatesInRange();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Periode Penggajian', style: UiKit.heading3),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: _startDate ?? DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2100),
                  );
                  if (d != null) setState(() => _startDate = d);
                },
                child: Text(
                  _startDate == null
                      ? 'Dari'
                      : DateFormat('dd/MM/yy').format(_startDate!),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_forward, size: 16),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  final d = await showDatePicker(
                    context: context,
                    initialDate: _endDate ?? DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2100),
                  );
                  if (d != null) setState(() => _endDate = d);
                },
                child: Text(
                  _endDate == null
                      ? 'Sampai'
                      : DateFormat('dd/MM/yy').format(_endDate!),
                ),
              ),
            ),
          ],
        ),
          const SizedBox(height: 24),
          const Text('Tampilkan Karyawan', style: UiKit.heading3),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectionMode = 'all'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _selectionMode == 'all'
                            ? Colors.white
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _selectionMode == 'all'
                            ? [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Center(
                        child: Text(
                          'Tampilkan Semua',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _selectionMode == 'all'
                                ? UiKit.primaryBlue
                                : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectionMode = 'manual'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _selectionMode == 'manual'
                            ? Colors.white
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _selectionMode == 'manual'
                            ? [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Center(
                        child: Text(
                          'Pilih Karyawan...',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _selectionMode == 'manual'
                                ? UiKit.primaryBlue
                                : Colors.grey,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (_selectionMode == 'manual') ...[
            const SizedBox(height: 16),
            TextField(
              controller: _employeeSearchController,
              decoration: InputDecoration(
                hintText: 'Cari nama / departemen...',
                prefixIcon: const Icon(Icons.search, size: 20),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (v) => setState(() {}),
            ),
            const SizedBox(height: 12),
            Container(
              constraints: const BoxConstraints(maxHeight: 200),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.withOpacity(0.2)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListView(
                shrinkWrap: true,
                children: _employees.where((emp) {
                  final search = _employeeSearchController.text.toLowerCase();
                  if (search.isEmpty) return true;
                  return emp['name'].toString().toLowerCase().contains(search) ||
                      emp['division_name'].toString().toLowerCase().contains(search);
                }).map((emp) {
                  final empId = emp['id'] as int;
                  final isSelected = _selectedEmployeeIds.contains(empId);
                  return CheckboxListTile(
                    value: isSelected,
                    title: Text(emp['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    subtitle: Text(emp['division_name'] ?? '-', style: const TextStyle(fontSize: 10)),
                    onChanged: (v) {
                      setState(() {
                        if (v == true) {
                          _selectedEmployeeIds.add(empId);
                        } else {
                          _selectedEmployeeIds.remove(empId);
                          _salaryMatrix.remove(empId);
                        }
                      });
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                    dense: true,
                  );
                }).toList(),
              ),
            ),
          ],
        if (dates.isNotEmpty) ...[
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Pilih Hari Kerja Aktif', style: UiKit.heading3),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: UiKit.primaryBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: UiKit.primaryBlue.withOpacity(0.2)),
                ),
                child: Text(
                  'Aktif: ${dates.length - _excludedDates.length} Hari',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: UiKit.primaryBlue,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildActiveDaysSelector(dates),
          const SizedBox(height: 24),
          Row(
            children: [
              const Expanded(
                child: Text('Matrix Gaji Per Hari', style: UiKit.heading3),
              ),
              _buildSmallActionBtn(
                icon: Icons.flash_on,
                label: 'Otomatis',
                color: Colors.orange,
                onTap: _autoFillAll,
              ),
              const SizedBox(width: 8),
              _buildSmallActionBtn(
                icon: Icons.delete_outline,
                label: 'Kosongkan',
                color: Colors.red,
                onTap: _resetMatrix,
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildMatrixGrid(dates),
        ],
      ],
    );
  }

  Widget _buildActiveDaysSelector(List<DateTime> dates) {
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final dateStr = DateFormat('yyyy-MM-dd').format(date);
          final isExcluded = _excludedDates.contains(dateStr);
          final dayName = DateFormat('EEE').format(date).toUpperCase();
          final dayNum = DateFormat('d').format(date);

          return GestureDetector(
            onTap: () {
              setState(() {
                if (isExcluded) {
                  _excludedDates.remove(dateStr);
                } else {
                  _excludedDates.add(dateStr);
                  for (final empId in _salaryMatrix.keys) {
                    _salaryMatrix[empId]?.remove(dateStr);
                  }
                }
              });
            },
            child: Container(
              width: 55,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: isExcluded ? Colors.white : const Color(0xFFF5F6FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isExcluded
                      ? Colors.grey.withOpacity(0.2)
                      : UiKit.primaryBlue.withOpacity(0.3),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    dayName,
                    style: TextStyle(
                      fontSize: 10,
                      color: isExcluded ? Colors.grey : UiKit.primaryBlue,
                      fontWeight: isExcluded
                          ? FontWeight.normal
                          : FontWeight.bold,
                    ),
                  ),
                  Text(
                    dayNum,
                    style: TextStyle(
                      fontSize: 14,
                      color: isExcluded ? Colors.grey : UiKit.primaryBlue,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSmallActionBtn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMatrixGrid(List<DateTime> dates) {
    if (_isLoadingEmployees) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text(
                'Memuat data karyawan...',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    if (_employeeFetchError != null) {
      return Center(
        child: Column(
          children: [
            Text(
              _employeeFetchError!,
              style: const TextStyle(color: Colors.red),
            ),
            TextButton(
              onPressed: _fetchEmployees,
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      );
    }

    if (_employees.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text('Tidak ada data karyawan aktif.'),
      );
    }

    final activeDates = dates
        .map((d) => DateFormat('yyyy-MM-dd').format(d))
        .where((d) => !_excludedDates.contains(d))
        .toList();

    if (activeDates.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.withOpacity(0.1)),
        ),
        child: const Column(
          children: [
            Icon(Icons.calendar_month, size: 40, color: Colors.grey),
            SizedBox(height: 8),
            Text(
              'Pilih hari kerja aktif di atas',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.withOpacity(0.2)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            // Header
            Row(
              children: [
                _buildGridCell('KARYAWAN', width: 180, isHeader: true),
                ...activeDates.map((dStr) {
                  final date = DateTime.parse(dStr);
                  final day = DateFormat('EEE').format(date).toUpperCase();
                  final num = DateFormat('d').format(date);
                  return _buildGridCell(
                    '$day\n$num',
                    width: 80,
                    isHeader: true,
                  );
                }),
                _buildGridCell('SUBTOTAL', width: 100, isHeader: true),
              ],
            ),
            // Rows
            ..._employees.where((emp) {
              if (_selectionMode == 'all') return true;
              return _selectedEmployeeIds.contains(emp['id']);
            }).map((emp) {
              final empId = emp['id'] as int;
              final matrix = _salaryMatrix[empId] ?? {};
              double subtotal = 0;
              int activeCount = 0;
              for (final dStr in activeDates) {
                final val = matrix[dStr] ?? 0.0;
                subtotal += val;
                if (val > 0) activeCount++;
              }

              return Row(
                children: [
                  _buildEmployeeCell(emp, empId),
                  ...activeDates.map((dStr) {
                    return _buildInputCell(empId, dStr);
                  }),
                  _buildSubtotalCell(subtotal, activeCount),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildGridCell(
    String text, {
    double width = 100,
    bool isHeader = false,
  }) {
    return Container(
      width: width,
      height: 45,
      alignment: isHeader ? Alignment.centerLeft : Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: isHeader ? const Color(0xFFF8F9FA) : Colors.white,
        border: Border(
          top: BorderSide(color: Colors.grey.withOpacity(0.1)),
          left: BorderSide(color: Colors.grey.withOpacity(0.1)),
          right: BorderSide(color: Colors.grey.withOpacity(0.1)),
          bottom: BorderSide(color: Colors.grey.withOpacity(0.2)),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: isHeader ? FontWeight.bold : FontWeight.normal,
          color: isHeader ? Colors.grey : Colors.black87,
        ),
      ),
    );
  }

  Widget _buildEmployeeCell(dynamic emp, int empId) {
    final baseSalary = double.tryParse(emp['base_salary'].toString()) ?? 0.0;
    return Container(
      width: 180,
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  emp['name'],
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${emp['division_name'] ?? '-'} • Rp ${(baseSalary / 1000000).toStringAsFixed(1)}JT',
                  style: const TextStyle(fontSize: 8, color: Colors.grey),
                ),
              ],
            ),
          ),
          Column(
            children: [
              InkWell(
                onTap: () => _autoFillRow(empId),
                child: const Icon(Icons.bolt, size: 14, color: Colors.amber),
              ),
              const SizedBox(height: 4),
              InkWell(
                onTap: () {
                  setState(() {
                    _salaryMatrix.remove(empId);
                  });
                },
                child: const Icon(Icons.close, size: 14, color: Colors.red),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInputCell(int empId, String dateStr) {
    final value = _salaryMatrix[empId]?[dateStr] ?? 0.0;
    final controller = TextEditingController(
      text: value == 0 ? '' : value.toStringAsFixed(0),
    );

    return Container(
      width: 80,
      height: 60,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        textAlign: TextAlign.center,
        decoration: InputDecoration(
          contentPadding: EdgeInsets.zero,
          hintText: '0',
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey.withOpacity(0.2)),
          ),
        ),
        onChanged: (val) {
          final double? num = double.tryParse(val);
          setState(() {
            _salaryMatrix[empId] ??= {};
            if (num != null) {
              _salaryMatrix[empId]![dateStr] = num;
            } else {
              _salaryMatrix[empId]!.remove(dateStr);
            }
          });
        },
      ),
    );
  }

  Widget _buildSubtotalCell(double subtotal, int count) {
    return Container(
      width: 100,
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F6FF),
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            NumberFormat.currency(
              locale: 'id_ID',
              symbol: 'Rp ',
              decimalDigits: 0,
            ).format(subtotal),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Color(0xFF3F3D9E),
            ),
          ),
          Text(
            '$count HARI',
            style: const TextStyle(
              fontSize: 8,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverHeader() {
    return SliverAppBar(
      expandedHeight: 140,
      pinned: true,
      backgroundColor: UiKit.primaryBlue,
      elevation: 0,
      leading: IconButton(
        onPressed: () => context.pop(),
        icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
      ),
      flexibleSpace: FlexibleSpaceBar(
        title: const Text(
          'Buat Pengajuan',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        background: Container(
          decoration: const BoxDecoration(gradient: UiKit.primaryGradient),
        ),
      ),
    );
  }

  Widget _buildItemTile(Map<String, dynamic> item, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: UiKit.backgroundGray,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['description'].text, style: UiKit.bodyTextBold),
                Text(
                  'Rp ${item['amount'].text}',
                  style: TextStyle(color: UiKit.primaryBlue),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => setState(() => _details.removeAt(index)),
            icon: const Icon(Icons.delete_outline, color: Colors.red),
          ),
        ],
      ),
    );
  }
}
