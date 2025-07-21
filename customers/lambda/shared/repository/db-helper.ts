import { MongoClient, Collection } from "mongodb";

export const dbHelper = {
  client: null as MongoClient | null,
  uri: null as string | null,

  async connect(uri: string): Promise<void> {
    if (this.client) return;

    this.uri = uri;

    this.client = await MongoClient.connect(uri);
  },

  async disconnect(): Promise<void> {
    await this.client?.close();
    this.client = null;
  },

  getCollection(name: string): Collection {
    if (!this.client) {
      throw new Error("MongoClient is not connected");
    }

    return this.client.db().collection(name);
  },

  map: (data: any): any => {
    const { _id, ...rest } = data;
    return { ...rest, id: _id.toHexString() };
  },

  mapCollection: (collection: any[]): any[] => {
    return collection.map((c) => dbHelper.map(c));
  },
};
