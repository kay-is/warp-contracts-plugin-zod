import { z } from 'zod';

// Used in the plugin constructor to ensure only Zod schemas are passed.
export type KeyedSchemas<Schemas> = { [key in keyof Schemas]: z.ZodType<Schemas[key]> };

// Allows the user to create a type map of the return types of the parser
// functions, it's used in the contract and its clients.
export type ParsedSchemas<Schemas> = {
  [key in keyof Schemas]: Schemas[key] extends z.ZodType<infer T> ? T : never;
};

// Used to extend the type of the global SmartWeave.extensions object with
// parser function signatures generated from the Zod schemas.
export type KeyedSchemaParsers<Schemas> = {
  [key in keyof Schemas]: (input: unknown, errorMsg?: string) => Schemas[key] extends z.ZodType<infer T> ? T : never;
};

// Allows the typing of the SmartWeave.extensions object in the contract.
// Includes basic Arweave and user schema parsers.
export type SmartWeaveExtensionZod<Schemas> = {
  extensions: {
    zod: {
      parse: KeyedSchemaParsers<ArweaveSchemas> & KeyedSchemaParsers<Schemas>;
    };
  };
};

// Arweave utility schemas and types
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

// Combine to make merging with user schemas easier.
export const arweaveSchemas = {
  arweaveAddr,
  arweaveBlockheight,
  arweaveTag,
  arweaveTxId,
  arweaveWinston
};

export type ArweaveSchemas = typeof arweaveSchemas;
