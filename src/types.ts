import { z } from 'zod';

export type KeyedSchemas<Schemas> = { [key in keyof Schemas]: Schemas[key] };

export type KeyedSchemaParsers<Schemas> = {
  [key in keyof Schemas]: (input: unknown, errorMsg?: string) => Schemas[key] extends z.ZodType<infer T> ? T : never;
};

export type ParsedSchemas<Schemas> = {
  [key in keyof Schemas]: Schemas[key] extends z.ZodType<infer T> ? T : never;
};

export type SmartWeaveExtensionZod<Schemas> = {
  extensions: {
    zod: {
      parse: KeyedSchemaParsers<Schemas>;
    };
  };
};

export const base64Url = z.string().regex(/^[a-zA-Z0-9_-]$/);
export type Base64Url = z.infer<typeof base64Url>;

export const arweaveAddr = base64Url.length(43);
export type ArweaveAddr = z.infer<typeof arweaveAddr>;

export const arweaveBlockheight = z.number().int().positive();
export type arweaveBlockheight = z.infer<typeof arweaveBlockheight>;

export const arweaveTag = z.object({
  name: z.string(),
  value: z.string()
});
export type ArweaveTag = z.infer<typeof arweaveTag>;

export const arweaveTxId = base64Url.length(43);
export type ArweaveTxId = z.infer<typeof arweaveTxId>;

export const arweaveWinston = z
  .string()
  .regex(/^([0-9]){1-13}$/)
  .max(13);
export type ArweaveWinston = z.infer<typeof arweaveWinston>;

export const arweaveSchemas = {
  arweaveAddr,
  arweaveBlockheight,
  arweaveTag,
  arweaveTxId,
  arweaveWinston
};
