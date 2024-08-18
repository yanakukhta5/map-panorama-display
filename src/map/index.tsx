import { useEffect, useState } from 'react'

import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'

import { Drawer } from './drawer'
import { Modal } from './modal'

import {
  OSMLayer,
  semaphoresLayer,
  lineLayer,
  roadCrossLayer,
  displayFeatureInfo,
} from './ol-config'

type TCurrentObject = Record<'country' | 'name', string> | undefined

export const MapComponent = () => {
  const [currentObject, setCurrentObject] = useState<TCurrentObject>()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const info = document.getElementById('info') as HTMLDivElement

    const map = new Map({
      target: 'map',
      view: new View({
        center: fromLonLat([39.0312, 45.0355]),
        zoom: 14,
      }),
      layers: [OSMLayer, semaphoresLayer, lineLayer, roadCrossLayer],
    })

    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        info.style.visibility = 'hidden'
        return
      }
      const pixel = map.getEventPixel(evt.originalEvent)
      displayFeatureInfo(pixel, evt.originalEvent.target, map, info)
    })

    map.on('singleclick', function (e) {
      map.forEachFeatureAtPixel(e.pixel, (feature) => {
        setCurrentObject(feature.getProperties() as TCurrentObject)
        setDrawerOpen(true)
      })
    })

    map.on('dblclick', function (e) {
      e.stopPropagation()
      map.forEachFeatureAtPixel(e.pixel, function (feature) {
        setCurrentObject(feature.getProperties() as TCurrentObject)
        setModalOpen(true)
      })
    })

    return () => map.setTarget(undefined)
  }, [])

  return (
    <div id="map" style={{ width: '100vw', height: '100vh' }}>
      <div id="info" />

      <Drawer
        open={Boolean(currentObject) && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        country={currentObject?.country}
        name={currentObject?.name}
      />

      <Modal
        open={Boolean(currentObject) && modalOpen}
        onClose={() => setModalOpen(false)}
        name={currentObject?.name}
      />
    </div>
  )
}
