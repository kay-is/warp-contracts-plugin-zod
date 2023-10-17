import { WarpPlugin, WarpPluginType } from 'warp-contracts';
import zod from 'zod';

export class ZodExtension implements WarpPlugin<any, void> {
  process(input: any): void {
    input.zod = zod;
  }

  type(): WarpPluginType {
    return 'smartweave-extension-zod';
  }
}
