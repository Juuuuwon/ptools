import { FC, useEffect, useState } from 'react'
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion'

import style from './style.module.scss'

export const LandingAnimation: FC = () => {
  const [isVisible, setVisible] = useState(true)
  const exitAnimation: TargetAndTransition = {
    opacity: 0
  }

  useEffect(() => {
    setTimeout(() => {
      setVisible(false)
    }, 1000)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div exit={exitAnimation} className={style.container}>
          <img src="https://storage.juwon.codes/jtools/suika.webp" alt="suika" />
          <h1>The JTOOLS</h1>
          <p>Right tools for you!</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
