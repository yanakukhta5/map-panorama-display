import { useRef } from 'react'

import ReactPannellum from 'react-pannellum'

import styles from './styles.module.scss'

export const Panorama = () => {
  const viewerRef = useRef(null)

  const handleSetPitch = () => {
    if (viewerRef.current) {
      ReactPannellum.setHfov(100)
      ReactPannellum.setPitch(0)
      ReactPannellum.setYaw(0)
    }
  }

  return (
    <div>
      <ReactPannellum
        ref={viewerRef}
        id="1"
        sceneId="firstScene"
        imageSource="/panorams/pano.jpg"
        hfov={100}
        pitch={0}
        yaw={0}
        config={{
          autoRotate: true,
          autoRotateInactivityDelay: 3000,
          autoLoad: true,
          title: 'Панорама',
          description: 'Описание этой панорамы',
        }}
      />
      <button className={styles.button} onClick={handleSetPitch}>
        Сбросить панораму в исходную позицию
      </button>
    </div>
  )
}
