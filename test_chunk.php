<?php
$uploadId = $argv[1];
$ch = curl_init("http://127.0.0.1:3030/api/chunked-upload/$uploadId/chunk");
$cfile = new CURLFile('test.bin', 'application/octet-stream', 'chunk.bin');
$data = array('chunk_index' => 0, 'file' => $cfile);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
echo "Response: " . $response . "\n";
echo "Error: " . curl_error($ch) . "\n";
echo "Status Code: " . curl_getinfo($ch, CURLINFO_HTTP_CODE) . "\n";
