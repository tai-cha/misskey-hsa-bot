import { captureElement } from './captureElement'
import { Misskey } from './misskey'
import type { Endpoints } from 'misskey-js'
import { exit } from 'process'

const url = 'https://www.wbgt.env.go.jp/alert.php'

type Job = {
  selector: string,
  outputPath: string
}

let jobs: Job[] = [
  {
    selector: '#td1_l',
    outputPath: './captures/today.png'
  },
  {
    selector: '#td2_l',
    outputPath: './captures/tomorrow.png'
  }
]

const mkAPIClientProvidor = new Misskey.api.APIClientProvidor()
const mkAPIClient = mkAPIClientProvidor.getClient()

let files: Array<Endpoints['drive/files/create']['res']> = (await Promise.all(jobs.map(async (job) => {
  await captureElement(url, job.selector, job.outputPath)
  try {
    // FOR FIX misskey-js problem, Using pure fetch request
    return await mkAPIClientProvidor.uploadFile(job.outputPath, job.outputPath.split('/').pop())
  } catch (err) {
    console.error(`Failed to create file: ${err}`);
    throw err;
  }
}))).filter(createdFile => createdFile != null)

let fileIds = files.map(file => file.id)
console.log(fileIds)
console.log(`File IDs: ${fileIds}`);

if (fileIds.length === 0) {
  console.error('No files created');
  exit(1);
}

const noteText = `今日の熱中症警戒アラート情報(${new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })}現在)`;

mkAPIClient.request('notes/create', { text: noteText, visibility: 'home', ...(fileIds.length > 0 ? { fileIds } : {}) }).then((res) => {
  const note = res.createdNote;
  console.log(`Note created: ${note.id}`);
}).catch((err) => {
  console.log(`Failed to create note: ${err}`);
  console.error(err);
});