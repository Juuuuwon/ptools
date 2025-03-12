import { createRef, FC, useEffect, useRef } from 'react'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { useRecoilState } from 'recoil'
import { EditorValueState } from '../GlobalStates/EditorValueState'
import { motion } from 'framer-motion'
import { VERSION } from '../version'
import { editor } from 'monaco-editor'

import style from './style.module.scss'

export const Editor: FC = () => {
  const [value, setValue] = useRecoilState(EditorValueState)
  const ref = useRef<editor.IStandaloneCodeEditor>()
  const containerRef = createRef<HTMLDivElement>()

  useEffect(() => {
    window.addEventListener('resize', () => {
      ref.current?.layout({ width: 0, height: 0 })

      window.requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect()
        ref.current?.layout({
          width: rect?.width ?? 0,
          height: rect?.height ?? 0
        })
      })
    })
  }, [containerRef])

  return (
    <motion.div
      className={style.container}
      ref={containerRef}
      transition={{ delay: 1.5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <MonacoEditor
        loading={<></>}
        value={value}
        language="yaml"
        onMount={(v) => (ref.current = v)}
        onChange={(v) => setValue(v ?? '')}
        options={{
          automaticLayout: true,
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          theme: 'vs-dark',
          fontSize: 24,
          fontFamily: 'JetBrains Mono Variable',
          fontLigatures: true,
          wordWrap: 'on',
          mouseWheelZoom: true,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          cursorBlinking: 'smooth',
          cursorStyle: 'line'
        }}
        theme="vs-dark"
      />

      <div className={style.credit}>
        <div className={style.creditstr}>
          <p>
            <b>The JTOOLS</b>
          </p>
          <p>v3-{VERSION}</p>
          <p>&copy; Minhyeok Park</p>
        </div>
        <img className={style.suika} src="https://storage.juwon.codes/jtools/suika.webp" />
      </div>
    </motion.div>
  )
}
