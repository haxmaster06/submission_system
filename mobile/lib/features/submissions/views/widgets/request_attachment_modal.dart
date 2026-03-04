import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/ui_kit.dart';
import 'package:mobile/features/submissions/providers/attachment_request_provider.dart';

class RequestAttachmentModal extends ConsumerStatefulWidget {
  final int submissionId;

  const RequestAttachmentModal({super.key, required this.submissionId});

  @override
  ConsumerState<RequestAttachmentModal> createState() =>
      _RequestAttachmentModalState();
}

class _RequestAttachmentModalState
    extends ConsumerState<RequestAttachmentModal> {
  final _descriptionController = TextEditingController();
  int? _selectedUserId;
  bool _isSuccess = false;

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (_selectedUserId == null || _descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih user dan isi deskripsi berkas!')),
      );
      return;
    }

    await ref
        .read(attachmentRequestControllerProvider.notifier)
        .sendRequest(
          submissionId: widget.submissionId,
          targetUserId: _selectedUserId!,
          fileDescription: _descriptionController.text.trim(),
        );
  }

  @override
  Widget build(BuildContext context) {
    final usersState = ref.watch(selectableUsersProvider);
    final controllerState = ref.watch(attachmentRequestControllerProvider);

    // Listen for success
    ref.listen(attachmentRequestControllerProvider, (previous, next) {
      if (next.isSuccess) {
        setState(() => _isSuccess = true);
        ref.read(attachmentRequestControllerProvider.notifier).reset();
      } else if (next.error != null) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal: ${next.error}')));
      }
    });

    return AlertDialog(
      backgroundColor: UiKit.backgroundWhite,
      shape: RoundedRectangleBorder(borderRadius: UiKit.borderRadiusDefault),
      title: const Text('Minta Lampiran', style: UiKit.heading3),
      content: SingleChildScrollView(
        child: _isSuccess
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 60,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Permintaan Terkirim!',
                    style: UiKit.heading2,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Silakan tunggu user target untuk mengunggah berkas.',
                    style: UiKit.bodyText,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Pilih User Penerima', style: UiKit.bodyTextBold),
                  const SizedBox(height: 8),
                  usersState.when(
                    loading: () => const LinearProgressIndicator(),
                    error: (err, _) => Text('Error loading users: $err'),
                    data: (users) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: UiKit.surfaceGray,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.grey.withValues(alpha: 0.2),
                        ),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _selectedUserId,
                          hint: const Text('Pilih User'),
                          isExpanded: true,
                          items: users.map((user) {
                            return DropdownMenuItem<int>(
                              value: user['id'],
                              child: Text(
                                '${user['name']} (${user['division']?['name'] ?? 'No Division'})',
                                style: UiKit.bodyText,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setState(() => _selectedUserId = val);
                          },
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('Deskripsi Berkas', style: UiKit.bodyTextBold),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _descriptionController,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: Invoice Hotel, Tiket Pesawat...',
                      fillColor: UiKit.surfaceGray,
                    ),
                    maxLines: 2,
                  ),
                ],
              ),
      ),
      actions: [
        if (_isSuccess)
          ElevatedButton(
            onPressed: () => context.pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: UiKit.primaryBlue,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 45),
            ),
            child: const Text('Tutup'),
          )
        else ...[
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Batal', style: TextStyle(color: UiKit.textGray)),
          ),
          ElevatedButton(
            onPressed: controllerState.isLoading ? null : _handleSubmit,
            style: ElevatedButton.styleFrom(
              backgroundColor: UiKit.primaryBlue,
              foregroundColor: Colors.white,
            ),
            child: controllerState.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Kirim',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ],
    );
  }
}
