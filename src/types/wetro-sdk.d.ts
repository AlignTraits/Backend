declare module 'wetro-sdk' {
  interface CategorizeOptions {
    resource: string;
    type: string;
    json_schema: Record<string, string>;
    categories: string[];
    prompt: string;
    collection_id?: string;
  }

  class Wetrocloud {
    constructor(config: { apiKey: string });
    categorize(options: CategorizeOptions): Promise<unknown>;
  }

  export default Wetrocloud;
}
