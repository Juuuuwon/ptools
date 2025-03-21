// src/components/TransformGridItem.tsx

import { ChangeEvent, FC, useEffect, useState } from 'react'
import style from './style.module.scss'
import { Button } from '../Components/Button'
import { Input } from '../Components/Input'
// Remove TextArea import as it's no longer used
import clsx from 'clsx'
import { useRecoilState } from 'recoil'
import { EditorValueState } from '../GlobalStates/EditorValueState'
import {
  TransformCheckboxOption,
  TransformIntboxOption,
  TransformRadioOption,
  TransformTextboxOption,
  WrappedTransform,
  WrappedTransformResult
} from '../Transforms/Transform'
import { useLocalStorage } from '@uidotdev/usehooks'
import { AnimatePresence, motion } from 'framer-motion'
import { Tooltip } from 'react-tooltip'
import { TextArea } from '../Components/TextArea'

interface TransformGridItemProp {
  transform: WrappedTransform
}

export const TransformGridItem: FC<TransformGridItemProp> = ({ transform }) => {
  const [value, setValue] = useRecoilState(EditorValueState)
  const [options, setOptions] = useState(transform.options)
  const [closedToggle, setClosedToggle] = useLocalStorage(
    `transform_closed__${transform.name}`,
    false
  )
  const [result, setResult] = useState<WrappedTransformResult>({
    error: false,
    value: ''
  })

  const previewDisabled = value.length > 30000
  const closed = previewDisabled || closedToggle

  const triggerTransform = async () =>
    await transform
      .fn(value, options)
      .then((result) => {
        setResult(result)
        return result
      })
      .catch((error) => {
        setResult({ error: true, value: error.toString() })
        return { error: true, value: error.toString() }
      })

  // Trigger transform when value, option or closed state changes
  useEffect(() => {
    if (previewDisabled) return

    transform
      .fn(value, options)
      .then(setResult.bind(this))
      .catch((error) => setResult({ error: true, value: error.toString() }))
  }, [value, options, closed, previewDisabled, transform])

  // Reset error state when options change
  useEffect(() => {
    if (!previewDisabled) return

    setResult({
      error: false,
      value: ''
    })
  }, [options, previewDisabled])

  // Force disable preview when value is longer than 30,000 chars
  useEffect(() => {
    if (previewDisabled) {
      setResult({
        error: false,
        value: ''
      })
      return
    }

    transform
      .fn(value, options)
      .then(setResult.bind(this))
      .catch((error) => setResult({ error: true, value: error.toString() }))
  }, [value, previewDisabled, transform, options])

  const onCheckboxOptionChanged =
    (option: TransformCheckboxOption) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      options.set(option.key, {
        ...option,
        value: event.target.checked
      })

      setOptions(new Map(options))
    }

  const onTextboxOptionChanged =
    (option: TransformTextboxOption) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      options.set(option.key, {
        ...option,
        value: event.target.value
      })

      setOptions(new Map(options))
    }

  const onIntboxOptionChanged =
    (option: TransformIntboxOption) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      options.set(option.key, {
        ...option,
        value: parseInt(event.target.value)
      })

      setOptions(new Map(options))
    }

  const onRadioOptionChanged =
    (option: TransformRadioOption) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      options.set(option.key, {
        ...option,
        value: event.target.value
      })

      setOptions(new Map(options))
    }

  const onForwardButtonPressed = async () => {
    const result = await triggerTransform()

    if (result.error) return

    setValue(result.value)
  }

  const onLabelClicked = async () => {
    if (previewDisabled) return

    setClosedToggle(!closed)
  }

  return (
    <div className={clsx(style.item, closed && style.closed)}>
      <div className={style.toolbar}>
        <div data-tooltip-id={`${transform.name}-tooltip`}>
          <Button disabled={result.error} onClick={onForwardButtonPressed}>
            &lt;&lt;&lt;
          </Button>
        </div>

        <Tooltip
          className={style.error}
          id={`${transform.name}-tooltip`}
          place="bottom"
        >
          {previewDisabled && result.error && result.value}
        </Tooltip>

        <h2
          onClick={onLabelClicked}
          className={clsx(style.name, previewDisabled && style.previewDisabled)}
        >
          {transform.name}
        </h2>

        <div className={style.options}>
          {[...options.values()]
            ?.filter((v) => v.type === 'CHECKBOX')
            .map((option, i) => (
              <label key={i} className={style.optionItem}>
                <p>{option.label ?? option.key}:</p>

                <Input
                  checked={option.value}
                  onChange={onCheckboxOptionChanged(option)}
                  type="checkbox"
                />
              </label>
            ))}

          {[...options.values()]
            ?.filter((v) => v.type === 'TEXTBOX')
            .map((option, i) => (
              <label key={i} className={style.optionItem}>
                <p>{option.label ?? option.key}:</p>

                <Input
                  value={option.value}
                  onChange={onTextboxOptionChanged(option)}
                  type="text"
                />
              </label>
            ))}

          {[...options.values()]
            ?.filter((v) => v.type === 'INTBOX')
            .map((option, i) => (
              <label key={i} className={style.optionItem}>
                <p>{option.label ?? option.key}:</p>

                <Input
                  min={1}
                  value={option.value}
                  onChange={onIntboxOptionChanged(option)}
                  type="number"
                />
              </label>
            ))}

          {[...options.values()]
            ?.filter((v) => v.type === 'RADIO')
            .map((option, i) => (
              <div
                key={i}
                onChange={onRadioOptionChanged(option)}
                className={style.optionItem}
              >
                {option.radios.map((radio, i2) => (
                  <label key={i2}>
                    <p>{radio.label ?? radio.value}:</p>

                    <Input
                      min={1}
                      name={option.key}
                      defaultChecked={radio.value === option.value}
                      value={radio.value}
                      type="radio"
                    />
                  </label>
                ))}
              </div>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {!closed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            exit={{ height: 0 }}
            className={style.output}
          >
            <TextArea
              readOnly
              value={result.value}
              placeholder="(empty)"
              className={clsx(result.error && style.error)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
