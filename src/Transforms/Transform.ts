import {
  Base64DecodeTransform,
  Base64EncodeTransform
} from './Base64Transforms'
// import { DatetimeTransform } from './DatetimeTransforms'
import {
  GzipCompressTransform,
  GzipDecompressTransform
} from './GzipTransform'
import {
  JSONBeautifyTransform,
  JSONEscapeTransform,
  JSONSimplifyTransform,
  JSONUnescapeTransform
} from './JSONTransforms'
import { RegexpTransform } from './RegexpTransform'
import { URIDecodeTransform, URIEncodeTransform } from './URITransforms'
// import { JSON2YAMLTransform, YAML2JSONTransform } from './YAMLTransforms'
import {
  PythonDictToJSONTransform,
//  JSONToPythonDictTransform
} from './PythonTransforms'

export interface TransformCheckboxOption {
  type: 'CHECKBOX'
  key: string
  label?: string
  value?: boolean
}

export interface TransformTextboxOption {
  type: 'TEXTBOX'
  key: string
  label?: string
  value?: string
}

export interface TransformIntboxOption {
  type: 'INTBOX'
  key: string
  label?: string
  value?: number
}

export interface TransformRadioOption {
  type: 'RADIO'
  key: string
  label?: string
  value?: string
  radios: {
    label?: string
    value: string
  }[]
}

export type TransformOption =
  | TransformCheckboxOption
  | TransformTextboxOption
  | TransformIntboxOption
  | TransformRadioOption

export interface Transform {
  name: string
  fn: (value: string, options: Map<string, TransformOption>) => Promise<string>
  options?: TransformOption[]
}

export interface WrappedTransformResult {
  error: boolean
  value: string
}

export interface WrappedTransform extends Omit<Transform, 'fn' | 'options'> {
  wrapped: true

  fn: (
    value: string,
    options: Map<string, TransformOption>
  ) => Promise<WrappedTransformResult>

  options: Map<string, TransformOption>
}

export const wrapTransform = (transform: Transform): WrappedTransform => ({
  ...transform,

  fn: async (...args) =>
    await transform
      .fn(...args)
      .then((value) => ({ error: false, value: value.toString() }))
      .catch((error) => ({ error: true, value: error.toString() })),

  options: new Map<string, TransformOption>(
    (transform.options ?? []).map((v) => [v.key, v])
  ),
  wrapped: true
})

export const transforms: Transform[] = [
  RegexpTransform,
  JSONBeautifyTransform,
  Base64DecodeTransform,
  Base64EncodeTransform,
  URIDecodeTransform,
  URIEncodeTransform,
  // DatetimeTransform,
  JSONEscapeTransform,
  JSONUnescapeTransform,
  // JSON2YAMLTransform,
  // YAML2JSONTransform,
  JSONSimplifyTransform,
  PythonDictToJSONTransform,
  // JSONToPythonDictTransform,
  GzipCompressTransform,
  GzipDecompressTransform
]
