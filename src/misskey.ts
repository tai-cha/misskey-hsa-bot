import * as Mk from "misskey-js"
import { config } from "dotenv"; 
import { readFileSync } from "fs";

const envResult = config();
if (envResult.error) {
  throw envResult.error;
}
const env = envResult.parsed;

export class Misskey {
  static api = {
    APIClientProvidor: class {
      #apiClient: Mk.api.APIClient;

      constructor() {
        if (!env || !env.MISSKEY_ORIGIN || !env.MISSKEY_TOKEN) {
          throw new Error('MISSKEY_ORIGIN and MISSKEY_TOKEN must be set in .env');
        }
        this.#apiClient = new Mk.api.APIClient({ origin: env.MISSKEY_ORIGIN, credential: env.MISSKEY_TOKEN });
      }

      getClient() {
        return this.#apiClient;
      }

      async request<T extends keyof Mk.Endpoints>(endpoint: T, params: Mk.Endpoints[T]['req']) {
        return await this.#apiClient.request(endpoint, params);
      }

      //FOR FIX misskey-js problem, Using pure POST request
      async uploadFile(filePath: string, name: string|undefined) : Promise<Mk.Endpoints['drive/files/create']['res']> {
        if (!env || !env.MISSKEY_ORIGIN || !env.MISSKEY_TOKEN) {
          throw new Error('MISSKEY_ORIGIN and MISSKEY_TOKEN must be set in .env');
        }

        const fileBuffer = readFileSync(filePath);
        const file = new File([fileBuffer], filePath, { type: 'application/octet-stream' });

        // FormDataを作成
        const form = new FormData();
        form.append('file', file);

        // APIにPOSTリクエストを送信
        const response = await fetch(`${env.MISSKEY_ORIGIN}/api/drive/files/create`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.MISSKEY_TOKEN}`,
            },
            body: form,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json() as Mk.Endpoints['drive/files/create']['res'];

        return result;
      }            
    }
  }
}