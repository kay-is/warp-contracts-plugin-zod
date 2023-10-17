/* eslint-disable @typescript-eslint/no-explicit-any */
import { WarpPlugin, WarpPluginType } from 'warp-contracts';
import { z } from 'zod';

export type zod = typeof z;

export class ZodExtension implements WarpPlugin<any, void> {
  process(input: any): void {
    input.zod = z;
  }

  type(): WarpPluginType {
    return 'smartweave-extension-zod';
  }
}
