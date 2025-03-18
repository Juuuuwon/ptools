import { Transform } from './Transform'

export const RegexpTransform: Transform = {
  name: 'curld',
  fn: async (v) => {
    return v.replace(/\\\"/g, "\"");
  }
}
