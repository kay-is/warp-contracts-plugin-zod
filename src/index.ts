/* eslint-disable @typescript-eslint/no-explicit-any */
import { WarpPlugin, WarpPluginType } from 'warp-contracts';
import { z } from 'zod';

export type Zod = typeof z;

export interface SmartweaveZodExtension {
  extensions: {
    z: Zod;
  };
}

export class ZodExtension implements WarpPlugin<any, void> {
  process(input: any): void {
    input.zod = z;
  }

  type(): WarpPluginType {
    global.zod = z;
    return 'smartweave-extension-zod';
  }
}
