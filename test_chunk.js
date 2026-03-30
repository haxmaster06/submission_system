const axios = require('axios');
const fs = require('fs');

async function test() {
  const api = axios.create({ baseURL: 'http://localhost:3030/api' });
  const token = ""; // Need token or just test if we get 401 instead of hanging

  try {
    const init = await api.post('/chunked-upload/init', { filename: 'test.apk', size: 1024 * 1024 * 2 });
    console.log("Init:", init.data);
    const id = init.data.upload_id;

    const FormData = require('form-data');
    const form = new FormData();
    form.append('chunk_index', 0);
    form.append('file', Buffer.alloc(1024 * 1024), 'chunk.bin');

    const res = await api.post(`/chunked-upload/${id}/chunk`, form, { headers: form.getHeaders() });
    console.log("Chunk:", res.data);
  } catch(e) { console.log(e.response ? e.response.status : e.message); }
}
test();
