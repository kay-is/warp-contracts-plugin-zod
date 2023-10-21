/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractError, WarpPlugin, WarpPluginType } from 'warp-contracts';
import { KeyedSchemas, arweaveSchemas } from './types';

export * from './types';

export class ZodExtension<Schemas> implements WarpPlugin<any, void> {
  private schemas: KeyedSchemas<Schemas>;

  private parse<T>(schema: Zod.ZodType<T>, input: unknown, errorMsg?: string): T {
    const result = schema.safeParse(input);
    if (result.success) return result.data;
    // @ts-expect-error The if-statement guards against this
    const errorMessage = errorMsg || result.error;
    throw new ContractError(errorMessage);
  }

  constructor(schemas: KeyedSchemas<Schemas>) {
    this.schemas = schemas;
  }

  type(): WarpPluginType {
    return 'smartweave-extension-zod';
  }

  process(extensionNamespace) {
    const parsers = {};

    for (const schema of Object.keys(arweaveSchemas))
      parsers[schema] = (input: unknown, errorMsg?: string) => this.parse(arweaveSchemas[schema], input, errorMsg);

    for (const schema of Object.keys(this.schemas))
      parsers[schema] = (input: unknown, errorMsg?: string) => this.parse(this.schemas[schema], input, errorMsg);

    extensionNamespace.zod = {
      parse: parsers
    };
  }
}
