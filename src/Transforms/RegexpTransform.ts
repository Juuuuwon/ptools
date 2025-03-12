import { Transform } from './Transform'

export const RegexpTransform: Transform = {
  name: 'regexp',
  fn: async (v) => {
    return v.replace(/"/g, "'");
  }
}
