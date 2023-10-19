/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractError, WarpPlugin, WarpPluginType } from 'warp-contracts';
import { z } from 'zod';

// To infer static types from schemas
export type Zod = typeof z;

const validate = <T>(schema: Zod.ZodType<T>, input: unknown) => {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  // @ts-expect-error if-statement guards against this error
  throw new ContractError(result.error);
};

export class ZodExtension implements WarpPlugin<any, void> {
  process() {}

  type(): WarpPluginType {
    // To make Zod available outside of a contract
    global.zod = z;
    global.validate = validate;

    return 'smartweave-extension-zod';
  }
}
