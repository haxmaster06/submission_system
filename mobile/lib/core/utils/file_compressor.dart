import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

class FileCompressor {
  static Future<File?> compressImage(File file) async {
    // Check if the file is an image (basic check by extension)
    final ext = file.path.split('.').last.toLowerCase();
    if (ext != 'jpg' && ext != 'jpeg' && ext != 'png') {
      return file; // Return original if not compressable image
    }

    final dir = await getTemporaryDirectory();
    final targetPath = '${dir.path}/${DateTime.now().millisecondsSinceEpoch}_compressed.jpg';

    // Compress image
    var result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path, 
      targetPath,
      quality: 70, // Adjust quality percentage
      minWidth: 1024,
      minHeight: 1024,
    );

    return result != null ? File(result.path) : file;
  }

  static Future<List<File>> compressMultipleImages(List<File> files) async {
    List<File> compressedFiles = [];
    for (var file in files) {
      final compressed = await compressImage(file);
      compressedFiles.add(compressed ?? file);
    }
    return compressedFiles;
  }
}
